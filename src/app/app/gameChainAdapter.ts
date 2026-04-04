import type { Hash } from "viem";

import type { Direction, Outcome } from "./config";

export type GameChainAdapter = {
  getConnectedAddress: () => string | undefined;
  openAuth: () => void;
  fundForWager: (
    wagerUsdc: number,
    opts?: { idempotencyKey?: string }
  ) => Promise<{ txHash: Hash }>;
  lockStake: (input: {
    clipId: bigint;
    wagerUsdc: number;
    direction: Direction;
    outcome: Outcome;
  }) => Promise<{
    ticketId: bigint;
    approveTxHash: Hash;
    playTxHash: Hash;
  }>;
  settle: (ticketId: bigint) => Promise<{ txHash: Hash }>;
  claim: (
    ticketId: bigint,
    recipient: `0x${string}`
  ) => Promise<{ txHash: Hash }>;
  readTicketAfterSettle: (ticketId: bigint) => Promise<{
    payout: bigint;
    canClaim: boolean;
  }>;
};
