"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export type DevGameState =
  | "wager"
  | "countdown"
  | "video_playing"
  | "prediction"
  | "video_resuming"
  | "result";

const STEPS: { id: DevGameState; label: string }[] = [
  { id: "wager", label: "Wager" },
  { id: "countdown", label: "Countdown" },
  { id: "video_playing", label: "Video (intro)" },
  { id: "prediction", label: "Prediction" },
  { id: "video_resuming", label: "Video (outro)" },
  { id: "result", label: "Result" },
];

type GameDevHudProps = {
  gameState: DevGameState;
  videoError: boolean;
  devVideoMock: boolean;
  onDevVideoMockChange: (value: boolean) => void;
  onJump: (step: DevGameState, options?: { resultWin?: boolean }) => void;
  /** Wager screen is light — use a readable floating button */
  surface?: "light" | "dark";
};

export function GameDevHud({
  gameState,
  videoError,
  devVideoMock,
  onDevVideoMockChange,
  onJump,
  surface = "dark",
}: GameDevHudProps) {
  const [open, setOpen] = useState(false);

  const triggerClass =
    surface === "light"
      ? "border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_95%,transparent)] text-[var(--foreground)] shadow-lg backdrop-blur-sm hover:bg-[var(--card)]"
      : "border border-[var(--game-border)] bg-[var(--game-nav-bg)] text-[var(--game-foreground)] shadow-lg backdrop-blur-md hover:brightness-95 dark:hover:brightness-110";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-4 left-4 z-[100] flex h-11 w-11 items-center justify-center rounded-full transition ${triggerClass}`}
        aria-label="Development tools: flow steps"
        title="Dev: game steps"
      >
        <GearIcon className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close panel"
              className="fixed inset-0 z-[99] bg-[var(--game-overlay)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="dev-hud-title"
              className="fixed bottom-[4.5rem] left-4 z-[100] w-[min(calc(100vw-2rem),320px)] rounded-2xl border border-[var(--game-border)] bg-[var(--game-surface-strong)] p-4 text-left shadow-2xl backdrop-blur-md"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h2
                id="dev-hud-title"
                className="mb-1 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-widest text-[var(--game-foreground)]"
              >
                Flow (dev)
              </h2>
              <p className="mb-3 text-xs text-[var(--game-foreground-muted)]">
                Current step:{" "}
                <span className="font-medium text-[var(--game-electric)]">
                  {STEPS.find((s) => s.id === gameState)?.label ?? gameState}
                </span>
                {videoError && devVideoMock && (
                  <span className="mt-1 block text-amber-400/90">
                    Real video failed. Using simulated fallback.
                  </span>
                )}
              </p>

              <label className="mb-4 flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--game-border)] bg-[var(--game-surface-elevated)] p-3 text-sm text-[var(--game-foreground-soft)]">
                <input
                  type="checkbox"
                  checked={devVideoMock}
                  onChange={(e) => onDevVideoMockChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--game-border-strong)]"
                />
                <span>
                  Use simulated fallback instead of messi-1 clips.
                </span>
              </label>

              <p className="mb-2 text-[10px] uppercase tracking-widest text-[var(--game-foreground-muted)]">
                Jump to step
              </p>
              <ul className="flex max-h-[40vh] flex-col gap-1.5 overflow-y-auto pr-1">
                {STEPS.map(({ id, label }) => {
                  const active = gameState === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          onJump(id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                          active
                            ? "bg-[color-mix(in_srgb,var(--game-electric)_24%,transparent)] text-[var(--game-foreground)] ring-1 ring-[color-mix(in_srgb,var(--game-electric)_50%,transparent)]"
                            : "bg-[var(--game-surface-elevated)] text-[var(--game-foreground-soft)] hover:brightness-95 dark:hover:brightness-110"
                        }`}
                      >
                        <span>{label}</span>
                        {active && (
                          <span className="text-[10px] uppercase tracking-wider text-[var(--game-electric)]">
                            current
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {gameState === "result" && (
                <div className="mt-3 flex gap-2 border-t border-[var(--game-border)] pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      onJump("result", { resultWin: true });
                      setOpen(false);
                    }}
                    className="flex-1 rounded-lg py-2 text-xs font-medium text-[var(--game-foreground)]"
                    style={{ background: "var(--game-success-surface)" }}
                  >
                    Force win
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onJump("result", { resultWin: false });
                      setOpen(false);
                    }}
                    className="flex-1 rounded-lg bg-[var(--game-surface-elevated)] py-2 text-xs font-medium text-[var(--game-foreground-soft)]"
                  >
                    Force loss
                  </button>
                </div>
              )}

              <p className="mt-3 text-[10px] text-[var(--game-foreground-muted)]">
                In production, the HUD stays hidden unless{" "}
                <code className="rounded bg-[var(--game-surface-elevated)] px-1">
                  NEXT_PUBLIC_GAME_DEV_HUD=true
                </code>
                . In dev, disable it with{" "}
                <code className="rounded bg-[var(--game-surface-elevated)] px-1">=false</code>.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
