"use client";

import { AnimatePresence, motion } from "framer-motion";

type WagerScreenProps = {
  helperText?: string | null;
  isBusy?: boolean;
  playLabel?: string;
  selectedWager: number | null;
  wagerOptions: readonly number[];
  playEnabled: boolean;
  onPickWager: (amount: number) => void;
  onPlay: () => void | Promise<void>;
};

export function WagerScreen({
  helperText,
  isBusy = false,
  playLabel = "Play with Testnet USDC",
  selectedWager,
  wagerOptions,
  playEnabled,
  onPickWager,
  onPlay,
}: WagerScreenProps) {
  return (
    <AnimatePresence>
      <motion.main
        key="wager"
        className="embed-viewport bg-[var(--background)] pt-16 text-[var(--foreground)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <section className="relative mx-auto flex min-h-[min(78dvh,720px)] w-full max-w-4xl flex-col items-center justify-center px-4 py-10 text-center sm:py-16">
          <div className="hero-glow" />
          <p className="relative z-10 mb-4 text-xs uppercase tracking-[0.3em] text-[var(--accent-mid)]">
            Predict It!
          </p>
          <h1
            className="relative z-10 text-[clamp(2.2rem,8vw,4.5rem)] font-bold leading-[1.08] tracking-tight"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >
            How confident are you?
          </h1>

          <div className="relative z-10 mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3">
            {wagerOptions.map((amount) => {
              const isSelected = selectedWager === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => onPickWager(amount)}
                  disabled={isBusy}
                  className="embed-touch-target inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold uppercase tracking-widest transition duration-300 sm:h-14"
                  style={{
                    background: isSelected ? "var(--accent)" : "var(--card)",
                    color: isSelected
                      ? "var(--background)"
                      : "var(--foreground)",
                    border: isSelected
                      ? "1px solid color-mix(in srgb, var(--accent) 70%, black)"
                      : "1px solid var(--border)",
                    boxShadow: isSelected
                      ? "0 10px 24px color-mix(in srgb, var(--accent) 22%, transparent)"
                      : "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  {amount} USDC
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!playEnabled || isBusy}
            onClick={onPlay}
            className="embed-touch-target relative z-10 mt-8 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full px-10 text-sm font-semibold uppercase tracking-widest transition duration-300 sm:mt-10 sm:h-14 sm:w-auto sm:min-w-52"
            style={{
              background: playEnabled && !isBusy
                ? "var(--accent)"
                : "color-mix(in srgb, var(--muted) 30%, transparent)",
              color: playEnabled && !isBusy
                ? "var(--background)"
                : "color-mix(in srgb, var(--foreground) 45%, transparent)",
              cursor: playEnabled && !isBusy ? "pointer" : "not-allowed",
              boxShadow: playEnabled && !isBusy
                ? "0 12px 26px color-mix(in srgb, var(--accent) 25%, transparent)"
                : "none",
            }}
          >
            {isBusy ? "Preparing..." : playLabel}
          </button>

          <p className="relative z-10 mt-5 max-w-2xl text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
            {helperText ??
              "Disclaimer: If you do not select the shot direction or fail to submit in time due to connection issues, you may lose the invested amount."}
          </p>
        </section>
      </motion.main>
    </AnimatePresence>
  );
}
