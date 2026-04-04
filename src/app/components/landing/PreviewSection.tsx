export function PreviewSection() {
  return (
    <section id="preview" className="embed-section">
      <div className="embed-shell">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          MVP Preview
        </p>
        <h2
          className="max-w-2xl text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
        >
          Powerful Payouts,
          <br />
          <span className="not-italic" style={{ fontFamily: "var(--font-geist)" }}>
            Thoughtfully Designed.
          </span>
        </h2>

        <div
          className="mt-8 overflow-hidden rounded-2xl transition duration-500 hover:-translate-y-1 hover:shadow-2xl sm:mt-10"
          style={{
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="relative aspect-video w-full p-4 sm:p-8 md:p-12"
            style={{ background: "var(--preview-gradient)" }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "var(--preview-glow)" }}
            />
            <div className="relative z-10 flex h-full flex-col">
              <div>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-[var(--accent)]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent) 15%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                  }}
                >
                  ● Live
                </span>
              </div>
              <div
                className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl border border-dashed border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--card)_65%,transparent)] sm:mt-6"
                aria-hidden
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] text-[var(--accent)]">
                    <span className="ml-0.5 text-xl">▶</span>
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
                    Video coming soon
                  </p>
                  <p className="px-4 text-xs text-[var(--muted)]">
                    16:9 placeholder ready for your final footage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
