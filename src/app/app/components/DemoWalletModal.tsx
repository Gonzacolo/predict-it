"use client";

import { useEffect, useRef } from "react";

type DemoWalletModalProps = {
  errorText?: string | null;
  errorTitle?: string;
  open: boolean;
  phase: "error" | "success" | "waiting";
  title: string;
  waitingText: string;
  successText: string;
  successSub: string;
  continueLabel: string;
  onContinue: () => void;
};

export function DemoWalletModal({
  errorText,
  errorTitle = "Transaction failed",
  open,
  phase,
  title,
  waitingText,
  successText,
  successSub,
  continueLabel,
  onContinue,
}: DemoWalletModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    if (phase === "success" || phase === "error") {
      continueRef.current?.focus();
    } else {
      panelRef.current?.focus();
    }
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "waiting") onContinue();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, onContinue]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--game-overlay)] px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && phase !== "waiting") onContinue();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-wallet-title"
        aria-busy={phase === "waiting"}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-[var(--game-border)] bg-[var(--game-surface-strong)] p-6 shadow-2xl outline-none sm:p-8"
      >
        <h2
          id="demo-wallet-title"
          className="font-[family-name:var(--font-bebas)] text-xl uppercase tracking-[0.2em] text-[var(--game-electric)] sm:text-2xl"
        >
          {title}
        </h2>

        {phase === "waiting" ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--game-border)] border-t-[var(--game-electric)]"
              aria-hidden
            />
            <p className="text-center text-sm leading-relaxed text-[var(--game-foreground-soft)]">
              {waitingText}
            </p>
          </div>
        ) : phase === "success" ? (
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-center text-lg font-medium text-[var(--game-foreground)]">
              {successText}
            </p>
            <p className="text-center text-sm text-[var(--game-foreground-muted)]">
              {successSub}
            </p>
            <button
              ref={continueRef}
              type="button"
              onClick={onContinue}
              className="game-cta-primary embed-touch-target mt-2 w-full rounded-xl text-sm font-semibold uppercase tracking-widest"
            >
              {continueLabel}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <p className="text-center text-lg font-medium text-rose-400">
              {errorTitle}
            </p>
            <p className="text-center text-sm text-[var(--game-foreground-muted)]">
              {errorText ?? "The wallet rejected or failed to send the transaction."}
            </p>
            <button
              ref={continueRef}
              type="button"
              onClick={onContinue}
              className="embed-touch-target mt-2 w-full rounded-xl border border-[var(--game-border)] px-4 py-3 text-sm font-semibold uppercase tracking-widest text-[var(--game-foreground)]"
            >
              {continueLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
