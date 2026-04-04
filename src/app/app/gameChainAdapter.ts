import type { Direction, Outcome } from "./config";

export type GameChainAdapter = {
  getConnectedAddress: () => string | undefined;
  openAuth: () => void;
  fundForWager: (wagerUsdc: number) => Promise<void>;
  lockStake: (input: {
    clipId: bigint;
    wagerUsdc: number;
    direction: Direction;
    outcome: Outcome;
  }) => Promise<bigint>;
  settle: (ticketId: bigint) => Promise<void>;
  claim: (ticketId: bigint, recipient: `0x${string}`) => Promise<void>;
  readTicketAfterSettle: (ticketId: bigint) => Promise<{
    payout: bigint;
    canClaim: boolean;
  }>;
};
