"use client";

import { AnimatePresence, motion } from "framer-motion";

import { appCopy } from "../copy";

type WagerScreenProps = {
  helperText?: string | null;
  /** Seconds for prediction window (from CONFIG). */
  predictionSeconds: number;
  /** Show prediction-market odds copy (on-chain rounds). */
  showMarketOdds?: boolean;
  isBusy?: boolean;
  busyLabel?: string;
  playLabel?: string;
  flowError?: string | null;
  onDismissFlowError?: () => void;
  playEnabled: boolean;
  onPlay: () => void | Promise<void>;
};

export function WagerScreen({
  helperText,
  predictionSeconds,
  showMarketOdds = false,
  isBusy = false,
  busyLabel = appCopy.wager.preparing,
  playLabel = "Play with Testnet USDC",
  flowError,
  onDismissFlowError,
  playEnabled,
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
          {flowError != null && flowError !== "" && (
            <div
              className="relative z-10 mb-6 w-full max-w-xl rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-left text-sm text-[var(--foreground)]"
              role="alert"
            >
              <p className="pr-8">{flowError}</p>
              {onDismissFlowError != null && (
                <button
                  type="button"
                  onClick={onDismissFlowError}
                  className="mt-2 text-xs font-semibold uppercase tracking-widest text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  {appCopy.flowError.dismiss}
                </button>
              )}
            </div>
          )}
          <p className="relative z-10 mb-4 text-xs uppercase tracking-[0.3em] text-[var(--accent-mid)]">
            Predict It!
          </p>
          <h1
            className="relative z-10 text-[clamp(2.2rem,8vw,4.5rem)] font-bold leading-[1.08] tracking-tight"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >
            How confident are you?
          </h1>

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
            {isBusy ? busyLabel : playLabel}
          </button>

          <div className="relative z-10 mt-6 w-full max-w-2xl space-y-4 text-left text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 p-4 sm:p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground)] sm:text-[0.8rem]">
                {appCopy.wager.rulesTitle}
              </p>
              <ol className="space-y-2">
                <li>1. {appCopy.wager.ruleStep1}</li>
                <li>2. {appCopy.wager.ruleStep2}</li>
                <li>3. {appCopy.wager.ruleStep3(predictionSeconds)}</li>
              </ol>
            </div>

            <p>
              {showMarketOdds
                ? appCopy.wager.marketOddsNote
                : appCopy.wager.demoModeNote}
            </p>

            {helperText != null && helperText !== "" ? (
              <p className="text-[var(--foreground)]/90">{helperText}</p>
            ) : null}

            <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-[var(--foreground)]">
              {appCopy.wager.disclaimer}
            </p>
          </div>
        </section>
      </motion.main>
    </AnimatePresence>
  );
}
