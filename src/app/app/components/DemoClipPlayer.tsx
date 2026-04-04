"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { appCopy } from "../copy";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

export type DemoClipPhase = "intro" | "paused" | "outro";

type DemoClipPlayerProps = {
  introSrc: string;
  outroSrc: string;
  poster?: string;
  phase: DemoClipPhase;
  slideUp: boolean;
  onReachedPausePoint: () => void;
  onEnded: () => void;
  onLoadError: () => void;
};

export function DemoClipPlayer({
  introSrc,
  outroSrc,
  poster,
  phase,
  slideUp,
  onReachedPausePoint,
  onEnded,
  onLoadError,
}: DemoClipPlayerProps) {
  const reduceMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [tapRequiredSrc, setTapRequiredSrc] = useState<string | null>(null);

  const currentSrc = phase === "outro" ? outroSrc : introSrc;
  const needsTapToPlay = tapRequiredSrc === currentSrc;
  const isBuffering =
    phase !== "paused" && readySrc !== currentSrc && !needsTapToPlay;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (phase === "paused") {
      el.pause();
      return;
    }

    let cancelled = false;
    el.currentTime = 0;
    el.load();

    el.play()
      .then(() => {
        if (!cancelled) setTapRequiredSrc(null);
      })
      .catch(() => {
        if (!cancelled) setTapRequiredSrc(currentSrc);
      });

    return () => {
      cancelled = true;
    };
  }, [currentSrc, phase]);

  const handleEnded = () => {
    if (phase === "intro") {
      onReachedPausePoint();
      return;
    }

    if (phase === "outro") {
      onEnded();
    }
  };

  const handleTapToStart = () => {
    const el = videoRef.current;
    if (!el) return;

    void el
      .play()
      .then(() => setTapRequiredSrc(null))
      .catch(() => setTapRequiredSrc(currentSrc));
  };

  const animateVideo =
    reduceMotion || !slideUp
      ? { y: "0%", scale: 1 }
      : { y: "-16%", scale: 0.92 };

  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden bg-[var(--game-surface-strong)]">
      {isBuffering && !needsTapToPlay && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--game-surface-strong)] text-sm font-medium text-[var(--game-foreground-muted)]"
          aria-live="polite"
        >
          {appCopy.video.loading}
        </div>
      )}
      <motion.div
        className="relative h-full w-full"
        animate={animateVideo}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 280, damping: 32 }
        }
        style={{ transformOrigin: "center top" }}
      >
        <video
          key={currentSrc}
          ref={videoRef}
          className="h-full w-full object-cover"
          src={currentSrc}
          poster={poster || undefined}
          playsInline
          muted
          preload="auto"
          onEnded={handleEnded}
          onError={onLoadError}
          onLoadedData={() => setReadySrc(currentSrc)}
          onCanPlay={() => setReadySrc(currentSrc)}
        />
      </motion.div>

      {needsTapToPlay && phase !== "paused" && (
        <button
          type="button"
          onClick={handleTapToStart}
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-[var(--game-overlay)] font-[family-name:var(--font-bebas)] text-2xl uppercase tracking-[0.2em] text-[var(--game-foreground)] backdrop-blur-sm"
        >
          {appCopy.video.tapToStart}
        </button>
      )}
    </div>
  );
}
