"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { appCopy } from "../copy";
import { type Direction, type Outcome } from "../config";
import type { PayoutBreakdown } from "../lib/payout";
import {
  getDefaultAppShareUrl,
  openPredictItTweetIntent,
} from "../lib/twitterIntent";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";
import { DemoClaimModal } from "./DemoClaimModal";

type ResultScreenProps = {
  won: boolean;
  userPrediction: { direction: Direction; outcome: Outcome } | null;
  wagerUsdc: number | null;
  onPlayAgain: () => void;
  replaySrc: string;
  actualDirection: Direction;
  actualOutcome: Outcome;
  settlement: PayoutBreakdown | null;
  simulateVideo: boolean;
};

function labelDirection(d: Direction) {
  return d === "left" ? appCopy.prediction.left : appCopy.prediction.right;
}

function labelOutcome(o: Outcome) {
  return o === "goal" ? appCopy.prediction.goal : appCopy.prediction.miss;
}

export function ResultScreen({
  won,
  userPrediction,
  wagerUsdc,
  onPlayAgain,
  replaySrc,
  actualDirection,
  actualOutcome,
  settlement,
  simulateVideo,
}: ResultScreenProps) {
  const reduceMotion = usePrefersReducedMotion();
  const canClaim = (settlement?.payoutTotal ?? 0) > 0;
  const payoutTotal = settlement?.payoutTotal ?? 0;
  const profit = settlement?.profit ?? 0;

  const [claimOpen, setClaimOpen] = useState(false);

  const handleShare = useCallback(() => {
    openPredictItTweetIntent({
      won,
      userPick: userPrediction
        ? `${labelDirection(userPrediction.direction)} + ${labelOutcome(userPrediction.outcome)}`
        : null,
      actualOutcome: `${labelDirection(actualDirection)} + ${labelOutcome(actualOutcome)}`,
      winningsUsdc: payoutTotal > 0 ? payoutTotal : undefined,
      appUrl: getDefaultAppShareUrl(),
    });
  }, [
    won,
    userPrediction,
    payoutTotal,
    actualDirection,
    actualOutcome,
  ]);

  const shellClass =
    "game-dark game-screen-fill fixed inset-0 z-[60] flex min-h-dvh w-full flex-col items-center justify-center overflow-y-auto overflow-x-clip px-4 py-[calc(2.5rem+var(--embed-safe-top))] pb-[calc(2.5rem+var(--embed-safe-bottom))]";

  if (won) {
    return (
      <motion.div
        className={shellClass}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
      >
        <DemoClaimModal
          open={claimOpen}
          title={appCopy.claimModal.title}
          body={appCopy.claimModal.body}
          closeLabel={appCopy.claimModal.close}
          onClose={() => setClaimOpen(false)}
        />
        {!reduceMotion && <ConfettiBurst />}
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center"
          initial={reduceMotion ? false : { scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 22 }
          }
        >
          <GameResultNav />
          <div className="mb-6 w-full">
            <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-2xl bg-[var(--game-surface-strong)] ring-1 ring-[var(--game-border)]">
              <ResultLoopVideo
                src={replaySrc}
                simulateVideo={simulateVideo}
                reduceMotion={reduceMotion}
              />
            </div>
          </div>
          {wagerUsdc != null && (
            <p className="mb-2 text-sm text-[var(--game-foreground-muted)]">
              {appCopy.result.playedWith(wagerUsdc)}
            </p>
          )}
          <p className="mb-2 font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.4em] text-[var(--game-electric)]">
            {appCopy.result.winLabel}
          </p>
          <h1 className="mb-4 font-[family-name:var(--font-bebas)] text-5xl uppercase leading-none text-[var(--game-foreground)] sm:text-6xl">
            {appCopy.result.winTitle}
          </h1>
          <p className="mb-8 text-lg text-[var(--game-foreground-soft)]">
            <span className="font-semibold text-[var(--game-win)]">
              {formatSignedUsd(profit)} USDC
            </span>
          </p>

          <PayoutSummary settlement={settlement} tone="win" />

          <div className="mb-6 w-full rounded-2xl border p-6 text-left shadow-xl backdrop-blur-sm" style={{ borderColor: "var(--game-success-border)", background: "var(--game-success-surface)" }}>
            <p className="mb-2 text-xs uppercase tracking-widest text-[var(--game-electric)]">
              {appCopy.result.yourPrediction}
            </p>
            <p className="text-lg font-medium text-[var(--game-foreground)]">
              {userPrediction
                ? `${labelDirection(userPrediction.direction)} + ${labelOutcome(userPrediction.outcome)}`
                : "—"}
            </p>
            <p className="mt-4 mb-2 text-xs uppercase tracking-widest text-[var(--game-foreground-muted)]">
              {appCopy.result.whatHappened}
            </p>
            <p className="text-lg font-medium text-[var(--game-electric)]">
              {labelDirection(actualDirection)} + {labelOutcome(actualOutcome)}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {canClaim && (
              <button
                type="button"
                onClick={() => setClaimOpen(true)}
                className="game-cta-primary embed-touch-target inline-flex w-full max-w-xs items-center justify-center rounded-full px-10 text-sm font-semibold uppercase tracking-widest sm:w-auto"
              >
                {appCopy.result.claimRewards}
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="embed-touch-target inline-flex w-full max-w-xs items-center justify-center rounded-full border-2 border-[var(--game-border-strong)] bg-[var(--game-surface-elevated)] px-8 text-sm font-semibold uppercase tracking-widest text-[var(--game-foreground)] transition hover:brightness-95 dark:hover:brightness-110 sm:w-auto"
            >
              {appCopy.result.shareX}
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="embed-touch-target inline-flex w-full max-w-xs items-center justify-center rounded-full border border-[var(--game-border)] px-8 text-sm font-medium uppercase tracking-widest text-[var(--game-foreground-soft)] transition hover:border-[var(--game-border-strong)] hover:text-[var(--game-foreground)] sm:w-auto"
            >
              {appCopy.result.playAgain}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={shellClass}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.4 }}
    >
      <DemoClaimModal
        open={claimOpen}
        title={appCopy.claimModal.title}
        body={appCopy.claimModal.body}
        closeLabel={appCopy.claimModal.close}
        onClose={() => setClaimOpen(false)}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <GameResultNav />
        <div className="mb-6 w-full">
          <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-2xl bg-[var(--game-surface-strong)] ring-1 ring-[var(--game-border)]">
            <ResultLoopVideo
              src={replaySrc}
              simulateVideo={simulateVideo}
              reduceMotion={reduceMotion}
            />
          </div>
        </div>
        {wagerUsdc != null && (
          <p className="mb-2 text-sm text-[var(--game-foreground-muted)]">
            {appCopy.result.playedWith(wagerUsdc)}
          </p>
        )}
        <p className="mb-2 font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.4em] text-[var(--game-foreground-muted)]">
          {appCopy.result.loseLabel}
        </p>
        <h1 className="mb-6 font-[family-name:var(--font-bebas)] text-5xl uppercase leading-none text-[var(--game-foreground)] sm:text-6xl">
          {appCopy.result.loseTitle}
        </h1>

        <p className="mb-8 text-lg text-[var(--game-foreground-soft)]">
          <span className="font-semibold text-rose-400">
            {formatSignedUsd(profit)} USDC
          </span>
        </p>

        <PayoutSummary settlement={settlement} tone="loss" />

        <div className="mb-8 w-full rounded-2xl border p-6 text-left shadow-xl backdrop-blur-sm" style={{ borderColor: "var(--game-danger-border)", background: "var(--game-danger-surface)" }}>
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--game-electric)]">
            {appCopy.result.yourPrediction}
          </p>
          <p className="text-lg font-medium text-[var(--game-foreground)]">
            {userPrediction
              ? `${labelDirection(userPrediction.direction)} + ${labelOutcome(userPrediction.outcome)}`
              : appCopy.result.incomplete}
          </p>
          <p className="mt-4 mb-2 text-xs uppercase tracking-widest text-[var(--game-foreground-muted)]">
            {appCopy.result.whatHappened}
          </p>
          <p className="text-lg font-medium text-[var(--game-electric)]">
            {labelDirection(actualDirection)} + {labelOutcome(actualOutcome)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {canClaim && (
            <button
              type="button"
              onClick={() => setClaimOpen(true)}
              className="game-cta-primary embed-touch-target inline-flex w-full max-w-xs items-center justify-center rounded-full px-10 text-sm font-semibold uppercase tracking-widest sm:w-auto"
            >
              {appCopy.result.claimRewards}
            </button>
          )}
          <button
            type="button"
            onClick={onPlayAgain}
            className="game-cta-primary embed-touch-target inline-flex w-full max-w-xs items-center justify-center rounded-full px-10 text-sm font-semibold uppercase tracking-widest sm:w-auto"
          >
            {appCopy.result.tryAgain}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="embed-touch-target inline-flex w-full max-w-xs items-center justify-center rounded-full border-2 border-[var(--game-border-strong)] bg-[var(--game-surface-elevated)] px-8 text-sm font-semibold uppercase tracking-widest text-[var(--game-foreground)] transition hover:brightness-95 dark:hover:brightness-110 sm:w-auto"
          >
            {appCopy.result.shareX}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function formatUsd(value: number) {
  return `${value.toFixed(2)} USDC`;
}

function formatSignedUsd(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${Math.abs(value).toFixed(2)}`;
}

function PayoutSummary({
  settlement,
  tone = "win",
}: {
  settlement: PayoutBreakdown | null;
  tone?: "win" | "loss";
}) {
  if (!settlement) return null;

  const isLoss = tone === "loss";

  return (
    <div
      className="mb-6 w-full rounded-2xl border p-5 text-left shadow-xl backdrop-blur-sm"
      style={{
        borderColor: isLoss
          ? "var(--game-danger-border)"
          : "var(--game-border)",
        background: isLoss
          ? "var(--game-danger-surface)"
          : "var(--game-surface-elevated)",
      }}
    >
      <p className="mb-4 text-xs uppercase tracking-widest text-[var(--game-electric)]">
        {appCopy.result.payoutSummary}
      </p>
      <div className="grid gap-3 text-sm text-[var(--game-foreground-soft)] sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--game-foreground-muted)]">
            {appCopy.result.directionPayout}
          </p>
          <p className="mt-1 font-medium text-[var(--game-foreground)]">
            {formatUsd(settlement.direction.netPayout)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--game-foreground-muted)]">
            {appCopy.result.outcomePayout}
          </p>
          <p className="mt-1 font-medium text-[var(--game-foreground)]">
            {formatUsd(settlement.outcome.netPayout)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--game-foreground-muted)]">
            {appCopy.result.totalPayout}
          </p>
          <p className="mt-1 font-medium text-[var(--game-foreground)]">
            {formatUsd(settlement.payoutTotal)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--game-foreground-muted)]">
            {appCopy.result.profitLoss}
          </p>
          <p
            className={`mt-1 font-medium ${
              settlement.profit < 0 ? "text-rose-400" : "text-[var(--game-foreground)]"
            }`}
          >
            {formatSignedUsd(settlement.profit)} USDC
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--game-foreground-muted)]">
        {appCopy.result.houseFee}: {formatUsd(settlement.houseFee)}
      </p>
    </div>
  );
}

function GameResultNav() {
  return (
    <nav className="mb-8 flex w-full flex-wrap justify-center gap-6 sm:justify-end">
      <Link
        href="/"
        className="text-xs uppercase tracking-widest text-[var(--game-foreground-muted)] transition hover:text-[var(--game-foreground)]"
      >
        {appCopy.nav.home}
      </Link>
      <Link
        href="/#how-it-works"
        className="text-xs uppercase tracking-widest text-[var(--game-foreground-muted)] transition hover:text-[var(--game-foreground)]"
      >
        {appCopy.nav.howItWorks}
      </Link>
    </nav>
  );
}

function ResultLoopVideo({
  src,
  simulateVideo,
  reduceMotion,
}: {
  src: string;
  simulateVideo: boolean;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const playbackFailed = !src || failedSrc === src;

  useEffect(() => {
    if (simulateVideo || playbackFailed) return;
    const el = ref.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {});
  }, [playbackFailed, src, simulateVideo]);

  if (simulateVideo || playbackFailed) {
    return (
      <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 bg-[var(--game-surface-strong)] px-4 text-center">
        <p className="font-[family-name:var(--font-bebas)] text-sm uppercase tracking-[0.25em] text-[var(--game-electric)]">
          {appCopy.result.simulatedReplay}
        </p>
        <p className="max-w-xs text-xs text-[var(--game-foreground-muted)]">
          {appCopy.result.simulatedReplayHint}
        </p>
        {!reduceMotion && (
          <div
            className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-[var(--game-ring-track)]"
            aria-hidden
          >
            <motion.span
              className="block h-full w-1/3 rounded-full bg-[var(--game-electric)]"
              animate={{ x: ["-100%", "280%"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <video
      ref={ref}
      className="h-full w-full object-cover"
      src={src}
      playsInline
      muted
      loop
      preload="auto"
      onError={() => setFailedSrc(src)}
      aria-label="Penalty replay on loop"
    />
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2;
        const dist = 120 + (i % 5) * 28;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist * 0.85;
        const colors = [
          "#22c55e",
          "#4ade80",
          "#166534",
          "#facc15",
          "#f0fdf4",
          "#86efac",
        ];
        const c = colors[i % colors.length];
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-[42%] h-2 w-2 rounded-sm"
            style={{ backgroundColor: c, marginLeft: -4, marginTop: -4 }}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [1, 1.2, 0.6],
              x,
              y,
              rotate: i * 40,
            }}
            transition={{
              duration: 1.2 + (i % 3) * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        );
      })}
    </div>
  );
}
