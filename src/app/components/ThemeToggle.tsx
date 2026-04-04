"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const nextThemeLabel = isDark ? "Light" : "Dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="embed-touch-target inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--card)] px-4 text-xs font-medium uppercase tracking-widest text-[var(--foreground)] transition hover:opacity-90"
      aria-label={`Switch to ${nextThemeLabel.toLowerCase()} mode`}
      title={`Switch to ${nextThemeLabel.toLowerCase()} mode`}
    >
      <span>{nextThemeLabel}</span>
      {isDark ? (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3c-.02.15-.03.3-.03.46a7 7 0 0 0 8.36 6.87c.46-.08.91-.2 1.34-.36.08.9.12 1.8.12 2.82Z" />
        </svg>
      )}
    </button>
  );
}
