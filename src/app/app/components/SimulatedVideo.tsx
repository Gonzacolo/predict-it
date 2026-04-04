"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

type SimulatedVideoProps = {
  pauseAtSeconds: number;
  phase: "intro" | "paused" | "outro";
  slideUp: boolean;
  onReachedPausePoint: () => void;
  onEnded: () => void;
};

export function SimulatedVideo({
  pauseAtSeconds,
  phase,
  slideUp,
  onReachedPausePoint,
  onEnded,
}: SimulatedVideoProps) {
  const reduceMotion = usePrefersReducedMotion();
  const introFiredRef = useRef(false);
  const outroFiredRef = useRef(false);

  useEffect(() => {
    if (phase !== "intro") return;
    introFiredRef.current = false;
    const ms = Math.max(300, pauseAtSeconds * 1000);
    const id = window.setTimeout(() => {
      if (introFiredRef.current) return;
      introFiredRef.current = true;
      onReachedPausePoint();
    }, ms);
    return () => window.clearTimeout(id);
  }, [phase, pauseAtSeconds, onReachedPausePoint]);

  useEffect(() => {
    if (phase !== "outro") return;
    outroFiredRef.current = false;
    const id = window.setTimeout(() => {
      if (outroFiredRef.current) return;
      outroFiredRef.current = true;
      onEnded();
    }, 1800);
    return () => window.clearTimeout(id);
  }, [phase, onEnded]);

  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden bg-[var(--game-surface-strong)]">
      <motion.div
        className="relative flex h-full w-full flex-col items-center justify-center bg-[var(--game-surface-strong)]"
        animate={
          reduceMotion || !slideUp
            ? { y: "0%", scale: 1 }
            : { y: "-16%", scale: 0.92 }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 280, damping: 32 }
        }
        style={{ transformOrigin: "center top" }}
      >
        <p className="font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.25em] text-[var(--game-foreground-muted)]">
          Simulated fallback
        </p>
        <p className="mt-2 max-w-xs px-6 text-center text-xs text-[var(--game-foreground-muted)]">
          Add before.mp4 and after.mp4 under public/videos/demo/messi-1 or any
          future set folder. Until then, the intro pauses at {pauseAtSeconds}s
          and the ending is simulated for about 1.8s.
        </p>
      </motion.div>
    </div>
  );
}
