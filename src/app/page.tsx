import { CONFIG } from "./app/config";
import { DemoPreviewVideo } from "./components/landing/DemoPreviewVideo";

export default function Home() {
  const stats = [
    { value: "3", label: "Steps to lock your pick" },
    { value: "$1–$25", label: "Fixed wagers" },
    { value: "$100B+", label: "Global betting market (context)" },
  ];

  const steps = [
    {
      num: "01",
      title: "Choose your wager",
      description:
        "Pick $1, $10, or $25 USDC. Funds lock in smart-contract escrow before the round starts.",
    },
    {
      num: "02",
      title: "Watch, then predict in two beats",
      description:
        "The Messi penalty video pauses before the strike. First you choose left or right, then whether it’s a goal or wide. A confirm step simulates signing the transaction.",
    },
    {
      num: "03",
      title: "Watch the outcome",
      description:
        "The clip resumes to the end and you see whether you matched the final outcome.",
    },
  ];

  const faqs = [
    {
      q: "What does this product show?",
      a: "Predict It! is a first prototype for short prediction game rounds built around real sports footage and outcome-based payouts.",
    },
    {
      q: "How will payouts work in production?",
      a: "The product vision uses Messi’s public career stats to derive transparent odds and on-chain settlement.",
    },
    {
      q: "What’s after Messi?",
      a: "You can see the full vision and roadmap in the Deck + Video Presentation.",
    },
    {
      q: "What blockchain is it for?",
      a: "The team is targeting an Ethereum L2 (e.g. Arbitrum) for low-cost escrow and settlement.",
    },
    {
      q: "Do I need KYC or signup?",
      a: "Not currently. A wallet connection gates escrow flows.",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] pt-16 text-[var(--foreground)]">
      {/* ── HERO ── */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 pt-12 text-center">
        <div className="hero-glow" />
        <p className="relative z-10 mb-6 text-xs uppercase tracking-[0.3em] text-[var(--accent-mid)]">
          Built for EthCC 2026
        </p>
        <h1
          className="relative z-10 mx-auto max-w-5xl text-[clamp(2.8rem,8vw,6rem)] font-bold leading-[1.05] tracking-tight text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
        >
          Predict It!
          <br />
          <span
            className="not-italic"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            Beneath The Surface.
          </span>
        </h1>
        <p className="relative z-10 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-xl">
          Predict real sports moments before the action resolves, lock your pick,
          then watch the outcome unfold.
        </p>
        <div className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-semibold uppercase tracking-widest text-[var(--background)] transition duration-300 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
            href="/app"
          >
            Play Now
          </a>
          <a
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] px-8 text-sm font-medium uppercase tracking-widest text-[var(--muted)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            href="#how-it-works"
          >
            Learn More
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div
            className="h-10 w-[1px] opacity-30"
            style={{
              background: "linear-gradient(to bottom, transparent, var(--accent))",
            }}
          />
        </div>
      </section>

      <hr className="divider mx-6" />

      {/* ── STATS ── */}
      <section className="px-4 py-16">
        <div
          className="mx-auto grid max-w-6xl grid-cols-1 gap-px md:grid-cols-3"
          style={{
            background: "var(--surface-grid-gap)",
            borderRadius: "1rem",
            overflow: "hidden",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center bg-[var(--background)] px-6 py-10 text-center transition duration-300 hover:bg-[var(--card)]"
            >
              <span className="stat-num text-4xl font-bold text-[var(--accent)] md:text-5xl">
                {s.value}
              </span>
              <span className="mt-2 text-xs uppercase tracking-widest text-[var(--muted)]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider mx-6" />

      {/* ── PREVIEW ── */}
      <section id="preview" className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            MVP Preview
          </p>
          <h2
            className="max-w-2xl text-4xl font-bold leading-tight text-[var(--foreground)] md:text-5xl"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >
            Powerful Payouts,
            <br />
            <span
              className="not-italic"
              style={{ fontFamily: "var(--font-geist)" }}
            >
              Thoughtfully Designed.
            </span>
          </h2>

          <div
            className="mt-10 overflow-hidden rounded-2xl transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
            style={{
              border: "1px solid var(--border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="relative aspect-video w-full p-8 md:p-12"
              style={{
                background: "var(--preview-gradient)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "var(--preview-glow)",
                }}
              />
              <div className="relative z-10 flex h-full flex-col">
                <div>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-[var(--accent)]"
                    style={{
                      background:
                        "color-mix(in srgb, var(--accent) 10%, transparent)",
                      border:
                        "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                    }}
                  >
                    ● Live
                  </span>
                </div>
                <div
                  className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl border border-dashed"
                  style={{
                    background:
                      "color-mix(in srgb, var(--card) 65%, transparent)",
                    borderColor:
                      "color-mix(in srgb, var(--accent) 35%, transparent)",
                  }}
                  aria-hidden
                >
                  <DemoPreviewVideo
                    src={CONFIG.LANDING_EXPLAINER_VIDEO_SRC}
                    poster={CONFIG.LANDING_EXPLAINER_POSTER || undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider mx-6" />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Step by Step
          </p>
          <h2
            className="mb-12 max-w-xl text-4xl font-bold text-[var(--foreground)] md:text-5xl"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >
            How It Works
          </h2>

          <div
            className="grid grid-cols-1 gap-px md:grid-cols-3"
            style={{
              background: "var(--surface-grid-gap)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {steps.map((step) => (
              <article
                key={step.title}
                className="group relative flex flex-col bg-[var(--background)] p-8 transition duration-300 hover:bg-[var(--card)]"
              >
                <span className="text-xs font-medium tracking-widest text-[var(--accent-mid)] opacity-70">
                  {step.num}
                </span>
                <h3 className="mt-4 text-xl font-semibold leading-snug text-[var(--foreground)] transition duration-300 group-hover:text-[var(--accent)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {step.description}
                </p>
                <div className="absolute inset-x-8 bottom-0 h-px scale-x-0 bg-[var(--accent)] opacity-30 transition duration-300 group-hover:scale-x-100" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider mx-6" />

      {/* ── FAQ ── */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Questions
          </p>
          <h2
            className="mb-10 text-4xl font-bold text-[var(--foreground)] md:text-5xl"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >
            FAQ
          </h2>
          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid var(--border)" }}
          >
            {faqs.map((faq, i) => (
              <details
                key={faq.q}
                className="faq-item group"
                style={{
                  background: "var(--card)",
                  borderBottom:
                    i < faqs.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition duration-200 hover:bg-[var(--muted-bg)]">
                  <span className="font-medium text-[var(--foreground)]">{faq.q}</span>
                  <span
                    className="faq-icon inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none text-[var(--accent)] transition-transform duration-300"
                    style={{
                      border:
                        "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                    }}
                  >
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed text-[var(--muted)]">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider mx-6" />

      {/* ── FOOTER ── */}
      <footer className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              A hackathon project by{" "}
              <span className="text-[var(--foreground)]">Gonza / WakeUp Labs</span>
              <br />
              Built for EthCC 2026 — transparent, trustless, on-chain.
            </p>
            <a
              href="/app"
              className="inline-flex h-10 items-center rounded-full bg-[var(--accent)] px-6 text-xs font-semibold uppercase tracking-widest text-[var(--background)] transition duration-300 hover:opacity-90 hover:shadow-md"
            >
              Play Now
            </a>
          </div>
          <hr className="divider" />
        </div>
      </footer>
    </main>
  );
}
