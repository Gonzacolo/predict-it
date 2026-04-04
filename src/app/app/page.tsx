"use client";

import {
  getGameEscrowAddress,
  getUsdcAddress,
  isGameOnchainEnabled,
} from "@/lib/gameChain";

import { AppOnchainGameFlow } from "./AppOnchainGameFlow";
import { GamePlay } from "./GamePlay";

export default function AppPage() {
  if (!isGameOnchainEnabled()) {
    return <GamePlay chain={null} />;
  }

  if (!process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID?.trim()) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center text-sm text-[var(--foreground)]">
        <p className="font-medium">
          On-chain mode is enabled but{" "}
          <code className="rounded bg-[var(--muted)] px-1">
            NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID
          </code>{" "}
          is missing.
        </p>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Copy{" "}
          <code className="rounded bg-[var(--muted)] px-1">.env.example</code>{" "}
          and fill in Dynamic and contract addresses.
        </p>
      </main>
    );
  }

  if (!getGameEscrowAddress() || !getUsdcAddress()) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center text-sm text-[var(--foreground)]">
        <p className="font-medium">
          Set{" "}
          <code className="rounded bg-[var(--muted)] px-1">
            NEXT_PUBLIC_GAME_ESCROW_ADDRESS
          </code>{" "}
          and{" "}
          <code className="rounded bg-[var(--muted)] px-1">
            NEXT_PUBLIC_USDC_ADDRESS
          </code>{" "}
          (non-zero escrow address).
        </p>
      </main>
    );
  }

  return <AppOnchainGameFlow />;
}
