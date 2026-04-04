import Link from "next/link";
import { isLeaderboardEnabled } from "@/features/leaderboard/flags";
import { ThemeToggle } from "../ThemeToggle";

export function LandingNav() {
  const showLeaderboard = isLeaderboardEnabled();

  return (
    <nav
      style={{ background: "var(--nav-bg)", backdropFilter: "blur(12px)" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-[var(--nav-border)]"
    >
      <div className="embed-shell flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--accent)] transition hover:opacity-90 sm:text-sm"
        >
          Predict It!
        </Link>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <Link
            href="/#how-it-works"
            className="embed-touch-target inline-flex items-center text-xs uppercase tracking-widest text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            How It Works
          </Link>
          {showLeaderboard && (
            <Link
              href="/app/leaderboard"
              className="embed-touch-target inline-flex items-center text-xs uppercase tracking-widest text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Leaderboard
            </Link>
          )}
          <ThemeToggle />
          <Link
            href="/app"
            className="embed-touch-target inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[var(--accent)] px-5 text-xs font-semibold uppercase tracking-widest text-[var(--background)] transition duration-300 hover:opacity-90 hover:shadow-md"
          >
            Play
          </Link>
        </div>
      </div>
    </nav>
  );
}
