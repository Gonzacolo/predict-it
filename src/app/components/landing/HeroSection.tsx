import { isLeaderboardEnabled } from "@/features/leaderboard/flags";

export function HeroSection() {
  const showLeaderboard = isLeaderboardEnabled();

  return (
    <section className="embed-viewport relative flex flex-col items-center justify-center px-4 pt-24 text-center sm:pt-28">
      <div className="hero-glow" />
      <p className="relative z-10 mb-5 text-xs uppercase tracking-[0.28em] text-[var(--accent-mid)]">
        Built for EthCC 2026
      </p>
      <h1
        className="relative z-10 mx-auto max-w-5xl text-[clamp(2.1rem,9.2vw,6rem)] font-bold leading-[1.05] tracking-tight text-[var(--foreground)]"
        style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
      >
        Predict It!
        <br />
        <span className="not-italic" style={{ fontFamily: "var(--font-geist)" }}>
          Beneath The Surface.
        </span>
      </h1>
      <p className="relative z-10 mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base md:text-xl">
        Predict real sports moments before the action resolves, lock your pick,
        then watch the outcome unfold.
      </p>
      <div className="relative z-10 mt-8 flex w-full max-w-md flex-col items-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center">
        <a
          className="embed-touch-target inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-semibold uppercase tracking-widest text-[var(--background)] transition duration-300 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg sm:w-auto"
          href="/app"
        >
          Play Now
        </a>
        {showLeaderboard && (
          <a
            className="embed-touch-target inline-flex w-full items-center justify-center rounded-full border border-[var(--border)] px-8 text-sm font-medium uppercase tracking-widest text-[var(--muted)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--foreground)] sm:w-auto"
            href="/app/leaderboard"
          >
            Leaderboard
          </a>
        )}
        <a
          className="embed-touch-target inline-flex w-full items-center justify-center rounded-full border border-[var(--border)] px-8 text-sm font-medium uppercase tracking-widest text-[var(--muted)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--foreground)] sm:w-auto"
          href="#how-it-works"
        >
          Learn More
        </a>
      </div>
    </section>
  );
}
