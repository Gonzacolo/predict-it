"use client";

import { useEffect, useRef } from "react";

type DemoClaimModalProps = {
  open: boolean;
  title: string;
  body: string;
  closeLabel: string;
  onClose: () => void;
};

export function DemoClaimModal({
  open,
  title,
  body,
  closeLabel,
  onClose,
}: DemoClaimModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-[var(--game-overlay)] px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-modal-title"
        className="w-full max-w-md rounded-2xl border border-[var(--game-border)] bg-[var(--game-surface-strong)] p-6 shadow-2xl sm:p-8"
      >
        <h2
          id="claim-modal-title"
          className="font-[family-name:var(--font-bebas)] text-xl uppercase tracking-[0.2em] text-[var(--game-electric)] sm:text-2xl"
        >
          {title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--game-foreground-soft)]">
          {body}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="game-cta-primary embed-touch-target mt-6 w-full rounded-xl text-sm font-semibold uppercase tracking-widest"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
