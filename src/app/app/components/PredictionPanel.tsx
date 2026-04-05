"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appCopy } from "../copy";
import type { Direction, Outcome } from "../config";
import { DemoWalletModal } from "./DemoWalletModal";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

type UiStep = 1 | 2 | 3;

type PredictionPanelProps = {
  onConfirmed: (choice: { direction: Direction; outcome: Outcome }) => void;
  onLockPrediction: (choice: {
    direction: Direction;
    outcome: Outcome;
  }) => Promise<void>;
  onTimeout: () => void;
  totalSeconds: number;
  wagerUsdc: number | null;
  walletWaitingText?: string;
};

const rowVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function PredictionPanel({
  onConfirmed,
  onLockPrediction,
  onTimeout,
  totalSeconds,
  wagerUsdc,
  walletWaitingText,
}: PredictionPanelProps) {
  const reduceMotion = usePrefersReducedMotion();

  const [uiStep, setUiStep] = useState<UiStep>(1);
  const uiStepRef = useRef(uiStep);
  useEffect(() => {
    uiStepRef.current = uiStep;
  }, [uiStep]);

  const [direction, setDirection] = useState<Direction | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [remainingMs, setRemainingMs] = useState(totalSeconds * 1000);

  const directionRef = useRef<Direction | null>(null);
  const outcomeRef = useRef<Outcome | null>(null);
  const firedRef = useRef(false);

  const [walletOpen, setWalletOpen] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [lockInFlight, setLockInFlight] = useState(false);
  const lockRunRef = useRef(false);
  const pendingChoiceRef = useRef<{
    direction: Direction;
    outcome: Outcome;
  } | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    outcomeRef.current = outcome;
  }, [outcome]);

  const finishAsTimeout = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setWalletOpen(false);
    onTimeout();
  }, [onTimeout]);

  const triggerWalletConfirmation = useCallback(async () => {
    if (firedRef.current || lockRunRef.current) return;
    const d = directionRef.current;
    const o = outcomeRef.current;

    if (d === null || o === null) {
      finishAsTimeout();
      return;
    }

    lockRunRef.current = true;
    pendingChoiceRef.current = { direction: d, outcome: o };
    setWalletError(null);
    setLockInFlight(true);

    try {
      await onLockPrediction({ direction: d, outcome: o });
      const c = pendingChoiceRef.current;
      pendingChoiceRef.current = null;
      if (!c) {
        lockRunRef.current = false;
        setLockInFlight(false);
        finishAsTimeout();
        return;
      }
      firedRef.current = true;
      lockRunRef.current = false;
      setLockInFlight(false);
      onConfirmed(c);
    } catch (error) {
      lockRunRef.current = false;
      setLockInFlight(false);
      const message =
        error instanceof Error
          ? error.message
          : "The transaction could not be confirmed.";
      setWalletError(message);
      setWalletOpen(true);
    }
  }, [finishAsTimeout, onLockPrediction, onConfirmed]);

  useEffect(() => {
    if (firedRef.current) return;

    const start = performance.now();
    const total = totalSeconds * 1000;
    let frame: number;

    const tick = (now: number) => {
      if (firedRef.current) return;
      const elapsed = now - start;
      const left = Math.max(0, total - elapsed);
      setRemainingMs(left);
      if (left <= 0) {
        if (uiStepRef.current === 3) {
          void triggerWalletConfirmation();
        } else {
          finishAsTimeout();
        }
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [totalSeconds, finishAsTimeout, triggerWalletConfirmation]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progress = useMemo(
    () => remainingMs / (totalSeconds * 1000),
    [remainingMs, totalSeconds]
  );

  const urgency =
    secondsLeft <= 2 ? "red" : secondsLeft <= 5 ? "yellow" : "white";

  const timerColor =
    urgency === "red"
      ? "#ef4444"
      : urgency === "yellow"
        ? "#facc15"
        : "var(--game-foreground)";

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference * (1 - progress);

  const pickDirection = (d: Direction) => {
    if (firedRef.current) return;
    setDirection(d);
    setUiStep(2);
  };

  const pickOutcome = (o: Outcome) => {
    if (firedRef.current) return;
    setOutcome(o);
    setUiStep(3);
  };

  const handleWalletErrorDismiss = () => {
    setWalletOpen(false);
    finishAsTimeout();
  };

  const showTimer = !walletOpen && !lockInFlight;
  const inlineLockMessage =
    walletWaitingText ?? appCopy.walletModal.waiting;

  return (
    <>
      <DemoWalletModal
        open={walletOpen}
        errorText={walletError}
        phase="error"
        title={appCopy.walletModal.title}
        waitingText={walletWaitingText ?? appCopy.walletModal.waiting}
        successText={appCopy.walletModal.success}
        continueLabel={appCopy.walletModal.continue}
        onContinue={handleWalletErrorDismiss}
      />

      {showTimer && (
        <motion.div
          className="pointer-events-none absolute right-3 top-3 z-30 sm:right-5 sm:top-5"
          initial={reduceMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.15, duration: 0.3 }}
        >
          <div
            className="flex items-center gap-2 rounded-full border border-white/25 bg-white/40 px-3 py-2 shadow-lg backdrop-blur-md dark:border-white/15 dark:bg-black/40 sm:gap-3 sm:px-4 sm:py-2.5"
            aria-hidden
          >
          <svg
            width="132"
            height="132"
            viewBox="0 0 48 48"
            className="h-[132px] w-[132px] shrink-0 -rotate-90 sm:h-[144px] sm:w-[144px]"
            aria-hidden
          >
            <circle
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke="var(--game-ring-track)"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke={timerColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke] duration-300"
            />
          </svg>
          <span
            className="min-w-[2.25ch] font-[family-name:var(--font-bebas)] text-6xl tabular-nums sm:text-7xl"
            style={{ color: timerColor }}
            aria-live="polite"
            aria-atomic="true"
          >
            00:{secondsLeft.toString().padStart(2, "0")}
          </span>
          </div>
        </motion.div>
      )}

      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 flex max-h-[min(50dvh,400px)] flex-col justify-end px-3 pb-[calc(1.5rem+var(--embed-safe-bottom))] pt-12 sm:max-h-[min(46dvh,440px)] sm:px-8 sm:pb-14 sm:pt-16"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div className="mb-4 flex justify-center gap-2 sm:mb-5">
          {([1, 2, 3] as const).map((n) => (
            <span
              key={n}
              className={`h-1.5 w-8 rounded-full transition-colors sm:w-10 ${
                uiStep === n
                  ? "bg-[var(--game-electric)]"
                  : uiStep > n
                    ? "bg-[var(--game-foreground-muted)]"
                    : "bg-[var(--game-ring-track)]"
              }`}
              aria-hidden
            />
          ))}
        </div>

        <div className="mx-auto w-full max-w-lg overflow-y-auto overflow-x-clip pb-1 sm:max-w-xl">
          <AnimatePresence mode="wait">
            {uiStep === 1 && (
              <motion.div
                key="step1"
                variants={rowVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                className="flex flex-col gap-4"
              >
                <p className="text-center font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.28em] text-[var(--game-foreground-muted)] sm:text-base">
                  {appCopy.prediction.step1}
                </p>
                <p className="text-center text-lg font-medium text-[var(--game-foreground)] sm:text-xl">
                  {appCopy.prediction.step1Q}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {(["left", "right"] as const).map((d) => (
                    <motion.div key={d} variants={itemVariants}>
                      <button
                        type="button"
                        onClick={() => pickDirection(d)}
                        className="game-prediction-btn embed-touch-target flex w-full items-center justify-center rounded-2xl px-4 py-4 text-base font-semibold uppercase tracking-widest transition-colors ring-offset-2 ring-offset-[var(--game-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--game-electric)] sm:min-h-16 sm:text-lg"
                        data-active={direction === d}
                      >
                        {d === "left"
                          ? appCopy.prediction.left
                          : appCopy.prediction.right}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {uiStep === 2 && (
              <motion.div
                key="step2"
                variants={rowVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                className="flex flex-col gap-4"
              >
                <p className="text-center font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.28em] text-[var(--game-foreground-muted)] sm:text-base">
                  {appCopy.prediction.step2}
                </p>
                <p className="text-center text-lg font-medium text-[var(--game-foreground)] sm:text-xl">
                  {appCopy.prediction.step2Q}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={() => pickOutcome("goal")}
                      className="game-prediction-btn embed-touch-target flex w-full items-center justify-center rounded-2xl px-4 py-4 text-base font-semibold uppercase tracking-widest transition-colors ring-offset-2 ring-offset-[var(--game-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--game-electric)] sm:min-h-16 sm:text-lg"
                      data-active={outcome === "goal"}
                    >
                      {appCopy.prediction.goal}
                    </button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={() => pickOutcome("miss")}
                      className="game-prediction-btn embed-touch-target flex w-full items-center justify-center rounded-2xl px-4 py-4 text-base font-semibold uppercase tracking-widest transition-colors ring-offset-2 ring-offset-[var(--game-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--game-electric)] sm:min-h-16 sm:text-lg"
                      data-active={outcome === "miss"}
                    >
                      {appCopy.prediction.miss}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {uiStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="flex flex-col gap-5 sm:gap-6"
              >
                <p className="text-center font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.28em] text-[var(--game-foreground-muted)] sm:text-base">
                  {appCopy.prediction.step3}
                </p>
                <div className="game-result-card rounded-2xl border border-[var(--game-border)] bg-[var(--game-surface-elevated)] px-5 py-4 text-center backdrop-blur-sm sm:px-6 sm:py-5">
                  {wagerUsdc != null && (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--game-electric)]">
                      {appCopy.nav.wager(wagerUsdc)}
                    </p>
                  )}
                  <p className="text-xs uppercase tracking-widest text-[var(--game-foreground-muted)]">
                    {appCopy.prediction.yourPick}
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-bebas)] text-2xl uppercase tracking-wide text-[var(--game-foreground)] sm:text-3xl">
                    {direction && outcome
                      ? `${direction === "left" ? appCopy.prediction.left : appCopy.prediction.right} · ${outcome === "goal" ? appCopy.prediction.goal : appCopy.prediction.miss}`
                      : "—"}
                  </p>
                  {lockInFlight ? (
                    <div className="mt-5 flex flex-col items-center gap-3">
                      <div
                        className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--game-border)] border-t-[var(--game-electric)]"
                        aria-hidden
                      />
                      <p className="text-sm leading-relaxed text-[var(--game-foreground-muted)]">
                        {inlineLockMessage}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-[var(--game-foreground-muted)]">
                      {appCopy.prediction.confirmHint}
                    </p>
                  )}
                </div>
                {!lockInFlight ? (
                  <p className="text-center text-sm font-medium text-[var(--game-electric)]">
                    {appCopy.prediction.confirmCta}
                  </p>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
