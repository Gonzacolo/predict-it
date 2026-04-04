"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { appCopy } from "../copy";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

export type VideoPhase = "intro" | "paused" | "outro";

type VideoPlayerProps = {
  src: string;
  poster?: string;
  pauseAt: number;
  phase: VideoPhase;
  slideUp: boolean;
  onReachedPausePoint: () => void;
  onEnded: () => void;
  onLoadError: () => void;
};

export function VideoPlayer({
  src,
  poster,
  pauseAt,
  phase,
  slideUp,
  onReachedPausePoint,
  onEnded,
  onLoadError,
}: VideoPlayerProps) {
  const reduceMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const pauseFiredRef = useRef(false);

  useEffect(() => {
    if (phase !== "intro") return;
    const el = videoRef.current;
    if (!el) return;
    pauseFiredRef.current = false;
    el.currentTime = 0;
    let cancelled = false;
    el.play()
      .then(() => {
        if (!cancelled) setNeedsTapToPlay(false);
      })
      .catch(() => {
        if (!cancelled) setNeedsTapToPlay(true);
      });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "outro") return;
    const el = videoRef.current;
    if (!el) return;
    let cancelled = false;
    el.play()
      .then(() => {
        if (!cancelled) setNeedsTapToPlay(false);
      })
      .catch(() => {
        if (!cancelled) setNeedsTapToPlay(true);
      });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || phase !== "intro" || pauseFiredRef.current) return;
    if (el.currentTime >= pauseAt) {
      el.pause();
      el.currentTime = pauseAt;
      pauseFiredRef.current = true;
      onReachedPausePoint();
    }
  };

  const handleEnded = () => {
    if (phase === "outro") {
      onEnded();
    }
  };

  const handleTapToStart = () => {
    const el = videoRef.current;
    if (!el) return;
    void el
      .play()
      .then(() => setNeedsTapToPlay(false))
      .catch(() => setNeedsTapToPlay(true));
  };

  const animateVideo =
    reduceMotion || !slideUp
      ? { y: "0%", scale: 1 }
      : { y: "-10%", scale: 0.94 };

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
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src}
          poster={poster || undefined}
          playsInline
          muted
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={onLoadError}
          onLoadedData={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
        />
      </motion.div>

      {needsTapToPlay && (
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
