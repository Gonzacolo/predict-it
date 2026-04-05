"use client";

import { useEffect, useRef } from "react";

import { getPlayAgainHref } from "../lib/playAgainHref";

type DemoClaimModalProps = {
  waitingTxLabel?: string;
  connectedWalletAddress: string;
  connectedWalletHint: string;
  connectedWalletTitle: string;
  destinationLabel: string;
  errorMessage?: string | null;
  onDestinationChange: (value: "connected" | "recipient") => void;
  onRecipientChange: (value: string) => void;
  onSubmit: () => void;
  open: boolean;
  phase: "editing" | "error" | "submitting" | "success";
  playAgainLabel: string;
  recipientInputLabel: string;
  recipientInputPlaceholder: string;
  recipientMode: "connected" | "recipient";
  recipientWalletHint: string;
  recipientWalletTitle: string;
  recipient: string;
  submitLabel: string;
  successBody?: string;
  title: string;
  body: string;
  onClose: () => void;
};

export function DemoClaimModal({
  waitingTxLabel = "Waiting for confirmation…",
  connectedWalletAddress,
  connectedWalletHint,
  connectedWalletTitle,
  destinationLabel,
  errorMessage,
  onDestinationChange,
  onRecipientChange,
  onSubmit,
  open,
  phase,
  playAgainLabel,
  recipientInputLabel,
  recipientInputPlaceholder,
  recipientMode,
  recipientWalletHint,
  recipientWalletTitle,
  recipient,
  submitLabel,
  successBody,
  title,
  body,
  onClose,
}: DemoClaimModalProps) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const playAgainRef = useRef<HTMLAnchorElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playAgainHref = getPlayAgainHref();
  const playAgainIsExternal = /^https?:\/\//i.test(playAgainHref);

  useEffect(() => {
    if (!open) return;
    if (phase === "success") {
      playAgainRef.current?.focus();
      return;
    }
    if ((phase === "editing" || phase === "error") && recipientMode === "recipient") {
      inputRef.current?.focus();
    } else {
      submitRef.current?.focus();
    }
  }, [open, phase, recipientMode]);

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
            <p className="mt-6 text-xs uppercase tracking-widest text-[var(--game-foreground-muted)]">
              {destinationLabel}
            </p>
            <div className="mt-3 grid gap-3">
              <button
                type="button"
                onClick={() => onDestinationChange("connected")}
                aria-pressed={recipientMode === "connected"}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  recipientMode === "connected"
                    ? "border-[var(--game-electric)] bg-[var(--game-surface-elevated)]"
                    : "border-[var(--game-border)] bg-[var(--game-surface)]"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--game-foreground)]">
                  {connectedWalletTitle}
                </p>
                <p className="mt-1 text-xs text-[var(--game-foreground-muted)]">
                  {connectedWalletHint}
                </p>
                <p className="mt-2 text-xs font-medium text-[var(--game-electric)]">
                  {connectedWalletAddress}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onDestinationChange("recipient")}
                aria-pressed={recipientMode === "recipient"}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  recipientMode === "recipient"
                    ? "border-[var(--game-electric)] bg-[var(--game-surface-elevated)]"
                    : "border-[var(--game-border)] bg-[var(--game-surface)]"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--game-foreground)]">
                  {recipientWalletTitle}
                </p>
                <p className="mt-1 text-xs text-[var(--game-foreground-muted)]">
                  {recipientWalletHint}
                </p>
              </button>
            </div>
            {recipientMode === "recipient" ? (
              <>
                <label
                  htmlFor="claim-recipient"
                  className="mt-6 block text-xs uppercase tracking-widest text-[var(--game-foreground-muted)]"
                >
                  {recipientInputLabel}
                </label>
                <input
                  id="claim-recipient"
                  ref={inputRef}
                  type="text"
                  value={recipient}
                  onChange={(event) => onRecipientChange(event.target.value)}
                  placeholder={recipientInputPlaceholder}
                  className="mt-2 w-full rounded-xl border border-[var(--game-border)] bg-[var(--game-surface)] px-4 py-3 text-sm text-[var(--game-foreground)] outline-none"
                />
              </>
            ) : null}
            {errorMessage ? (
              <p className="mt-3 text-sm text-rose-400">{errorMessage}</p>
            ) : null}
            <div className="mt-6">
              <button
                ref={submitRef}
                type="button"
                onClick={onSubmit}
                className="game-cta-primary embed-touch-target w-full rounded-xl text-sm font-semibold uppercase tracking-widest"
              >
                {submitLabel}
              </button>
            </div>
          </>
        ) : phase === "success" ? (
          <a
            ref={playAgainRef}
            href={playAgainHref}
            onClick={() => onClose()}
            rel={playAgainIsExternal ? "noreferrer" : undefined}
            className="game-cta-primary embed-touch-target mt-6 flex w-full items-center justify-center rounded-xl text-sm font-semibold uppercase tracking-widest"
          >
            {playAgainLabel}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="game-cta-primary embed-touch-target mt-6 w-full cursor-wait rounded-xl text-sm font-semibold uppercase tracking-widest opacity-80"
          >
            {waitingTxLabel}
          </button>
        )}
      </div>
    </div>
  );
}
