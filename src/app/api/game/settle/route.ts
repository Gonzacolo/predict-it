import { createPublicClient, http } from "viem";
import { NextResponse } from "next/server";

import { assertGameOnchainConfig } from "@/lib/gameChain";
import { gameEscrowAbi } from "@/lib/contracts/gameEscrowAbi";
import { clientIpFromRequest, gameApiLog } from "@/lib/server/gameApiLog";
import { createEscrowOwnerWalletClient } from "@/lib/server/gameWallets";

type SettleBody = {
  ticketId?: string;
};

export async function POST(request: Request) {
  let body: SettleBody;
  try {
    body = (await request.json()) as SettleBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = body.ticketId?.trim();
  if (!raw || !/^\d+$/.test(raw)) {
    return NextResponse.json({ error: "ticketId must be a decimal string." }, { status: 400 });
  }

  const ticketId = BigInt(raw);
  const ip = clientIpFromRequest(request);

  try {
    const { chain, escrow } = assertGameOnchainConfig();
    const rpc = chain.rpcUrls.default.http[0];
    const publicClient = createPublicClient({
      chain,
      transport: http(rpc),
    });
    const wallet = createEscrowOwnerWalletClient();

    const hash = await wallet.writeContract({
      account: wallet.account,
      chain: wallet.chain,
      address: escrow,
      abi: gameEscrowAbi,
      functionName: "settle",
      args: [ticketId],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    gameApiLog({
      route: "settle",
      event: "success",
      ip,
      ticketId: raw,
      txHash: hash,
    });

    return NextResponse.json({ ok: true, txHash: hash });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Settle failed.";
    gameApiLog({
      route: "settle",
      event: "error",
      ip,
      ticketId: raw,
      message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
