import type { LandingStat } from "./types";

type StatsSectionProps = {
  stats: LandingStat[];
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="embed-section">
      <div
        className="embed-shell grid grid-cols-1 gap-px md:grid-cols-3"
        style={{
          background: "var(--surface-grid-gap)",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center bg-[var(--background)] px-6 py-9 text-center transition duration-300 hover:bg-[var(--card)]"
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
  );
}
