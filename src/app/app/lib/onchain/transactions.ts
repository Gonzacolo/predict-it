import {
  createPublicClient,
  http,
  maxUint256,
  parseEventLogs,
  type Address,
  type Chain,
  type Hash,
  type WalletClient,
} from "viem";
import { erc20Abi } from "viem";

import { gameEscrowAbi } from "@/lib/contracts/gameEscrowAbi";

export function createGamePublicClient(chain: Chain, rpcUrl: string) {
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

export async function approveAndPlay(params: {
  walletClient: WalletClient;
  publicClient: ReturnType<typeof createGamePublicClient>;
  usdc: Address;
  escrow: Address;
  clipId: bigint;
  amount: bigint;
  direction: number;
  outcome: number;
}): Promise<{ ticketId: bigint; playTxHash: Hash }> {
  const { walletClient, publicClient, usdc, escrow } = params;
  const account = walletClient.account;
  if (!account) {
    throw new Error("Wallet account unavailable.");
  }

  const approveHash = await walletClient.writeContract({
    address: usdc,
    abi: erc20Abi,
    functionName: "approve",
    args: [escrow, maxUint256],
    account,
    chain: walletClient.chain,
  });

  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  const playHash = await walletClient.writeContract({
    address: escrow,
    abi: gameEscrowAbi,
    functionName: "play",
    args: [params.clipId, params.amount, params.direction, params.outcome],
    account,
    chain: walletClient.chain,
  });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: playHash,
  });

  const logs = parseEventLogs({
    abi: gameEscrowAbi,
    eventName: "TicketCreated",
    logs: receipt.logs,
  });

  const first = logs[0];
  const ticketId =
    first &&
    "args" in first &&
    first.args &&
    typeof first.args === "object" &&
    "ticketId" in first.args
      ? (first.args as { ticketId: bigint }).ticketId
      : undefined;

  if (ticketId === undefined) {
    throw new Error("TicketCreated event not found.");
  }

  return { ticketId, playTxHash: playHash };
}

export async function claimToTicket(params: {
  walletClient: WalletClient;
  publicClient: ReturnType<typeof createGamePublicClient>;
  escrow: Address;
  ticketId: bigint;
  recipient: Address;
}): Promise<Hash> {
  const account = params.walletClient.account;
  if (!account) {
    throw new Error("Wallet account unavailable.");
  }

  const hash = await params.walletClient.writeContract({
    address: params.escrow,
    abi: gameEscrowAbi,
    functionName: "claimTo",
    args: [params.ticketId, params.recipient],
    account,
    chain: params.walletClient.chain,
  });

  await params.publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
