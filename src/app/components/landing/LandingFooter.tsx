export function LandingFooter() {
  return (
    <footer className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="embed-shell">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            A hackathon project by{" "}
            <span className="text-[var(--foreground)]">Gonza / WakeUp Labs</span>
            <br />
            Built for EthCC 2026 - transparent, trustless, on-chain.
          </p>
          <a
            href="/app"
            className="embed-touch-target inline-flex items-center rounded-full bg-[var(--accent)] px-6 text-xs font-semibold uppercase tracking-widest text-[var(--background)] transition duration-300 hover:opacity-90 hover:shadow-md"
          >
            Play Now
          </a>
        </div>
        <hr className="divider" />
      </div>
    </footer>
  );
}
