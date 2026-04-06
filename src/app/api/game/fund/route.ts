import { createPublicClient, http, isAddress } from "viem";
import { erc20Abi } from "viem";
import { NextResponse } from "next/server";

import { assertGameOnchainConfig } from "@/lib/gameChain";
import { dynamicRestConfigOrNull } from "@/lib/dynamicSdk";
import {
  checkFundRateLimits,
  fundIdempotencyKey,
  getCachedFundResponse,
  matchesIdemEntry,
  rememberFundSuccess,
} from "@/lib/server/fundGuards";
import { clientIpFromRequest, gameApiLog } from "@/lib/server/gameApiLog";
import { createOperatorWalletClient } from "@/lib/server/gameWallets";

type FundBody = {
  playerWalletAddress?: string;
  desiredWagerUsdc?: number;
};
const SUPPORTED_WAGER_USDC = 1;

export async function POST(request: Request) {
  void dynamicRestConfigOrNull;

  let body: FundBody;
  try {
    body = (await request.json()) as FundBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const player = body.playerWalletAddress;
  const wager = body.desiredWagerUsdc;

  if (!player || !isAddress(player)) {
    return NextResponse.json(
      { error: "playerWalletAddress must be a valid EVM address." },
      { status: 400 }
    );
  }

  if (wager !== SUPPORTED_WAGER_USDC) {
    return NextResponse.json(
      { error: "desiredWagerUsdc must be 1." },
      { status: 400 }
    );
  }

  const playerLower = player.toLowerCase();
  const idemHeader = request.headers.get("idempotency-key");
  const idemKey = fundIdempotencyKey(idemHeader, playerLower, wager);
  const cached = getCachedFundResponse(idemKey);
  if (cached) {
    if (!matchesIdemEntry(cached, playerLower, wager)) {
      gameApiLog({
        route: "fund",
        event: "idempotency_conflict",
        idemKeyPrefix: idemKey.slice(0, 12),
      });
      return NextResponse.json(
        { error: "Idempotency-Key reused with different body." },
        { status: 409 }
      );
    }
    gameApiLog({
      route: "fund",
      event: "idempotent_replay",
      player: playerLower,
      wager,
    });
    return NextResponse.json({
      ok: true,
      txHash: cached.txHash,
      fundedAmount: cached.fundedAmount,
      replayed: true,
    });
  }

  const ip = clientIpFromRequest(request);
  const limit = checkFundRateLimits(ip, playerLower);
  if (!limit.ok) {
    gameApiLog({
      route: "fund",
      event: "rate_limited",
      ip,
      player: playerLower,
      retryAfterSec: limit.retryAfterSec,
    });
    return NextResponse.json(
      { error: "Too many funding requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    );
  }

  try {
    const { usdc } = assertGameOnchainConfig();
    const wallet = createOperatorWalletClient();
    const stake = BigInt(wager) * BigInt(1_000_000);
    const fundedAmount = stake * BigInt(3);
    const publicClient = createPublicClient({
      chain: wallet.chain,
      transport: http(wallet.chain.rpcUrls.default.http[0]),
    });
    const operatorBalance = (await publicClient.readContract({
      address: usdc,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [wallet.account.address],
    })) as bigint;

    if (operatorBalance < fundedAmount) {
      gameApiLog({
        route: "fund",
        event: "insufficient_operator_balance",
        ip,
        player: playerLower,
        wager,
        operatorBalance: operatorBalance.toString(),
        requiredBalance: fundedAmount.toString(),
      });
      return NextResponse.json(
        {
          error:
            "Funding temporarily unavailable: operator wallet has insufficient USDC balance.",
        },
        { status: 503 }
      );
    }

    const hash = await wallet.writeContract({
      account: wallet.account,
      chain: wallet.chain,
      address: usdc,
      abi: erc20Abi,
      functionName: "transfer",
      args: [player, fundedAmount],
    });

    rememberFundSuccess(
      idemKey,
      hash,
      fundedAmount.toString(),
      playerLower,
      wager
    );

    gameApiLog({
      route: "fund",
      event: "success",
      ip,
      player: playerLower,
      wager,
      txHash: hash,
    });

    return NextResponse.json({
      ok: true,
      txHash: hash,
      fundedAmount: fundedAmount.toString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Funding failed.";
    const normalizedMessage = /transfer amount exceeds balance/i.test(message)
      ? "Funding temporarily unavailable: operator wallet has insufficient USDC balance."
      : message;
    gameApiLog({
      route: "fund",
      event: "error",
      ip,
      player: playerLower,
      wager,
      message: normalizedMessage,
    });
    return NextResponse.json({ error: normalizedMessage }, { status: 500 });
  }
}
