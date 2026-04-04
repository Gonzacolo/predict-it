"use client";

import { useEffect, useRef } from "react";

type DemoClaimModalProps = {
  closeLabel: string;
  errorMessage?: string | null;
  onRecipientChange: (value: string) => void;
  onSubmit: () => void;
  open: boolean;
  phase: "editing" | "error" | "submitting" | "success";
  recipient: string;
  submitLabel: string;
  successBody?: string;
  title: string;
  body: string;
  onClose: () => void;
};

export function DemoClaimModal({
  closeLabel,
  errorMessage,
  onRecipientChange,
  onSubmit,
  open,
  phase,
  recipient,
  submitLabel,
  successBody,
  title,
  body,
  onClose,
}: DemoClaimModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (phase === "editing" || phase === "error") {
      inputRef.current?.focus();
    } else {
      closeRef.current?.focus();
    }
  }, [open, phase]);

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
          {phase === "success" ? successBody ?? body : body}
        </p>

        {phase === "editing" || phase === "error" ? (
          <>
            <label
              htmlFor="claim-recipient"
              className="mt-6 block text-xs uppercase tracking-widest text-[var(--game-foreground-muted)]"
            >
              Recipient wallet
            </label>
            <input
              id="claim-recipient"
              ref={inputRef}
              type="text"
              value={recipient}
              onChange={(event) => onRecipientChange(event.target.value)}
              placeholder="0x..."
              className="mt-2 w-full rounded-xl border border-[var(--game-border)] bg-[var(--game-surface)] px-4 py-3 text-sm text-[var(--game-foreground)] outline-none"
            />
            {errorMessage ? (
              <p className="mt-3 text-sm text-rose-400">{errorMessage}</p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={onSubmit}
                className="game-cta-primary embed-touch-target w-full rounded-xl text-sm font-semibold uppercase tracking-widest"
              >
                {submitLabel}
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="embed-touch-target w-full rounded-xl border border-[var(--game-border)] px-4 py-3 text-sm font-semibold uppercase tracking-widest text-[var(--game-foreground)]"
              >
                {closeLabel}
              </button>
            </div>
          </>
        ) : (
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="game-cta-primary embed-touch-target mt-6 w-full rounded-xl text-sm font-semibold uppercase tracking-widest"
          >
            {phase === "submitting" ? "Waiting for confirmation..." : closeLabel}
          </button>
        )}
      </div>
    </div>
  );
}
