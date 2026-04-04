import type { LandingStep } from "./types";

type HowItWorksSectionProps = {
  steps: LandingStep[];
};

export function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="embed-section">
      <div className="embed-shell">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Step by Step
        </p>
        <h2
          className="mb-10 max-w-xl text-3xl font-bold text-[var(--foreground)] sm:text-4xl md:mb-12 md:text-5xl"
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
              className="group relative flex flex-col bg-[var(--background)] p-6 transition duration-300 hover:bg-[var(--card)] sm:p-8"
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
  );
}
