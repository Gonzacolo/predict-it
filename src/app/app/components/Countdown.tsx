"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

const MS_PER_NUMBER = 1000;

type CountdownProps = {
  onComplete: () => void;
};

export function Countdown({ onComplete }: CountdownProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [value, setValue] = useState<3 | 2 | 1 | null>(3);

  useEffect(() => {
    if (reduceMotion) {
      const id = window.setTimeout(onComplete, MS_PER_NUMBER * 3 + 450);
      return () => window.clearTimeout(id);
    }
  }, [reduceMotion, onComplete]);

  useEffect(() => {
    if (reduceMotion) return;
    if (value === null) return;
    const t = window.setTimeout(() => {
      if (value === 1) setValue(null);
      else setValue((v) => (v === 3 ? 2 : 1));
    }, MS_PER_NUMBER);
    return () => window.clearTimeout(t);
  }, [value, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    if (value !== null) return;
    const id = window.setTimeout(onComplete, 450);
    return () => window.clearTimeout(id);
  }, [value, onComplete, reduceMotion]);

  if (reduceMotion) {
    return (
      <div
        className="game-dark fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
        role="status"
        aria-live="polite"
      >
        <p className="font-[family-name:var(--font-bebas)] text-2xl uppercase tracking-[0.3em] text-[var(--game-foreground-soft)]">
          Getting ready...
        </p>
      </div>
    );
  }

  return (
    <div
      className="game-dark fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-[var(--game-surface)]" />
      <AnimatePresence mode="wait">
        {value !== null && (
          <motion.span
            key={value}
            className="relative z-10 flex select-none items-center justify-center font-[family-name:var(--font-bebas)] text-[min(36vw,200px)] leading-none tracking-tight text-[var(--game-foreground)] sm:text-[min(34vw,220px)]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.35 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {value}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
