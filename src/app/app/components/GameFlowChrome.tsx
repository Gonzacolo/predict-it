"use client";

import Link from "next/link";
import { appCopy } from "../copy";
import { isLeaderboardEnabled } from "@/features/leaderboard/flags";
import { ThemeToggle } from "@/app/components/ThemeToggle";

type GameFlowChromeProps = {
  variant: "light" | "dark";
  selectedWager: number | null;
  statusLabel?: string;
  className?: string;
};

export function GameFlowChrome({
  variant,
  selectedWager,
  statusLabel,
  className = "",
}: GameFlowChromeProps) {
  const isLight = variant === "light";
  const showLeaderboard = isLeaderboardEnabled();
  const linkClass = isLight
    ? "embed-touch-target inline-flex items-center text-xs uppercase tracking-widest text-[var(--muted)] transition hover:text-[var(--foreground)]"
    : "embed-touch-target inline-flex items-center text-xs uppercase tracking-widest text-[var(--game-foreground-muted)] transition hover:text-[var(--game-foreground)]";
  const brandClass = isLight
    ? "text-xs font-semibold tracking-[0.2em] uppercase text-[var(--accent)] transition hover:opacity-90 sm:text-sm"
    : "text-xs font-semibold tracking-[0.2em] uppercase text-[var(--game-electric)] transition hover:opacity-90 sm:text-sm";
  const metaClass = isLight
    ? "text-xs uppercase tracking-widest text-[var(--muted)]"
    : "text-xs uppercase tracking-widest text-[var(--game-foreground-muted)]";
  const ctaClass = isLight
    ? "embed-touch-target inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[var(--accent)] px-5 text-xs font-semibold uppercase tracking-widest text-[var(--background)] transition duration-300 hover:opacity-90 hover:shadow-md"
    : "embed-touch-target inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[var(--game-border)] bg-[var(--game-surface-elevated)] px-5 text-xs font-semibold uppercase tracking-widest text-[var(--game-foreground)] transition duration-300 hover:brightness-95 dark:hover:brightness-110";

  return (
    <header
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 ${className}`}
    >
      <Link href="/" className={brandClass}>
        Predict It!
      </Link>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <Link href="/" className={linkClass}>
          {appCopy.nav.home}
        </Link>
        <Link href="/#how-it-works" className={linkClass}>
          {appCopy.nav.howItWorks}
        </Link>
        {showLeaderboard && (
          <Link href="/app/leaderboard" className={linkClass}>
            {appCopy.nav.leaderboard}
          </Link>
        )}
        {(statusLabel != null || selectedWager != null) && (
          <span className={metaClass} role="status">
            {statusLabel ??
              (selectedWager != null
                ? appCopy.nav.wager(selectedWager)
                : appCopy.nav.wagerPending)}
          </span>
        )}
        <ThemeToggle />
        <button type="button" className={ctaClass} disabled>
          {appCopy.nav.connectWallet}
        </button>
      </div>
    </header>
  );
}
