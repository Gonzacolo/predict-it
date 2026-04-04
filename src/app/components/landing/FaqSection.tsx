import type { LandingFaq } from "./types";

type FaqSectionProps = {
  faqs: LandingFaq[];
};

export function FaqSection({ faqs }: FaqSectionProps) {
  return (
    <section className="embed-section">
      <div className="embed-shell">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Questions
        </p>
        <h2
          className="mb-8 text-3xl font-bold text-[var(--foreground)] sm:text-4xl md:mb-10 md:text-5xl"
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
              <summary className="embed-touch-target flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition duration-200 hover:bg-[var(--background)] sm:px-6 sm:py-5">
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
              <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--muted)] sm:px-6">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
