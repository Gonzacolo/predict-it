import { isAddress } from "viem";
import { erc20Abi } from "viem";
import { NextResponse } from "next/server";

import { assertGameOnchainConfig } from "@/lib/gameChain";
import { dynamicRestConfigOrNull } from "@/lib/dynamicSdk";
import { createOperatorWalletClient } from "@/lib/server/gameWallets";

type FundBody = {
  playerWalletAddress?: string;
  desiredWagerUsdc?: number;
};

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

  if (wager !== 1 && wager !== 10 && wager !== 25) {
    return NextResponse.json(
      { error: "desiredWagerUsdc must be 1, 10, or 25." },
      { status: 400 }
    );
  }

  try {
    const { usdc } = assertGameOnchainConfig();
    const wallet = createOperatorWalletClient();
    const stake = BigInt(wager) * BigInt(1_000_000);
    const fundedAmount = stake * BigInt(3);

    const hash = await wallet.writeContract({
      account: wallet.account,
      chain: wallet.chain,
      address: usdc,
      abi: erc20Abi,
      functionName: "transfer",
      args: [player, fundedAmount],
    });

    return NextResponse.json({
      ok: true,
      txHash: hash,
      fundedAmount: fundedAmount.toString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Funding failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
