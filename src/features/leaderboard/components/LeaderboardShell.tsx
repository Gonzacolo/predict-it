"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getMockLeaderboardEntries,
  getMockPlayerProfile,
  getReservedEnsNames,
} from "../data/mockLeaderboard";
import type { LeaderboardBadge, LeaderboardEntry, PlayerProfile } from "../types";

type FilterMode = "top10" | "all";

const badgeLabel: Record<LeaderboardBadge, string> = {
  "daily-winner": "Daily winner",
  "top-scorer": "Top scorer",
  "ens-verified": "ENS verified",
};

export function LeaderboardShell() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() =>
    getMockLeaderboardEntries()
  );
  const [profile, setProfile] = useState<PlayerProfile>(() => getMockPlayerProfile());
  const [filter, setFilter] = useState<FilterMode>("top10");
  const [ensInput, setEnsInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(() =>
    getCountdownLabel(profile.dailyStatus.nextResetAt)
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdownLabel(profile.dailyStatus.nextResetAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [profile.dailyStatus.nextResetAt]);

  const visibleEntries = useMemo(
    () => (filter === "top10" ? entries.slice(0, 10) : entries),
    [entries, filter]
  );

  const canLinkEns = Boolean(profile.address) && !profile.ensName;

  const handleConnect = () => {
    setProfile((current) => ({
      ...current,
      address: current.address ?? "0x84f2...1c92",
    }));
    setEntries((current) =>
      current.map((entry) =>
        entry.isCurrentUser ? { ...entry, displayName: entry.address } : entry
      )
    );
    setFeedback("Wallet connected. You can now link one ENS to this address.");
  };

  const handleDisconnect = () => {
    setProfile((current) => ({ ...current, address: null, ensName: null }));
    setEntries((current) =>
      current.map((entry) =>
        entry.isCurrentUser ? { ...entry, ensName: null, displayName: entry.address } : entry
      )
    );
    setEnsInput("");
    setFeedback("Wallet disconnected.");
  };

  const handleLinkEns = () => {
    const candidate = ensInput.trim().toLowerCase();

    if (!profile.address) {
      setFeedback("Connect a wallet before linking an ENS.");
      return;
    }

    if (!candidate.endsWith(".eth")) {
      setFeedback("Use a valid ENS ending in .eth.");
      return;
    }

    const reserved = new Set(getReservedEnsNames());
    if (profile.ensName) reserved.delete(profile.ensName);

    if (reserved.has(candidate)) {
      setFeedback("That ENS is already linked to another address.");
      return;
    }

    setProfile((current) => ({ ...current, ensName: candidate }));
    setEntries((current) =>
      current.map((entry) =>
        entry.isCurrentUser
          ? {
              ...entry,
              ensName: candidate,
              displayName: candidate,
              badges: entry.badges.includes("ens-verified")
                ? entry.badges
                : [...entry.badges, "ens-verified"],
            }
          : entry
      )
    );
    setFeedback("ENS linked successfully. One ENS is now mapped to this address.");
    setEnsInput("");
  };

  return (
    <main className="embed-viewport bg-[var(--background)] pt-16 text-[var(--foreground)]">
      <section className="embed-section">
        <div className="embed-shell">
          <div className="hero-glow" />
          <div className="relative z-10">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--accent-mid)]">
              Daily competition
            </p>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1
                  className="text-[clamp(2.2rem,8vw,4.5rem)] font-bold leading-[1.08] tracking-tight"
                  style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
                >
                  Leaderboard
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  Play with your wallet address, link one ENS from this dashboard,
                  and climb the ranking based on score and total plays. Players can
                  only play once per day.
                </p>
              </div>

              <div
                className="rounded-3xl border px-5 py-4"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                }}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  Reward track
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                  Top players will unlock extra rewards in the next phase.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
            <section
              className="rounded-[2rem] border p-4 sm:p-6"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "0 12px 26px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                    Ranking
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Top predictors
                  </h2>
                </div>

                <div
                  className="inline-flex rounded-full border p-1"
                  style={{ borderColor: "var(--border)", background: "var(--muted-bg)" }}
                >
                  <button
                    type="button"
                    onClick={() => setFilter("top10")}
                    className="embed-touch-target rounded-full px-4 text-xs font-semibold uppercase tracking-widest transition"
                    style={{
                      background: filter === "top10" ? "var(--accent)" : "transparent",
                      color:
                        filter === "top10" ? "var(--background)" : "var(--foreground)",
                    }}
                  >
                    Top 10
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="embed-touch-target rounded-full px-4 text-xs font-semibold uppercase tracking-widest transition"
                    style={{
                      background: filter === "all" ? "var(--accent)" : "transparent",
                      color: filter === "all" ? "var(--background)" : "var(--foreground)",
                    }}
                  >
                    All players
                  </button>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3 text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-[var(--muted)]">
                      <th className="px-4">Rank</th>
                      <th className="px-4">Player</th>
                      <th className="px-4">Times played</th>
                      <th className="px-4">Score</th>
                      <th className="px-4">Last played</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEntries.map((entry) => (
                      <tr
                        key={entry.address}
                        className="rounded-3xl"
                        style={{
                          background: entry.isCurrentUser
                            ? "color-mix(in srgb, var(--accent) 10%, white)"
                            : "var(--background)",
                        }}
                      >
                        <td className="rounded-l-[1.5rem] px-4 py-4 text-sm font-semibold">
                          #{entry.rank}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex min-w-[220px] flex-col gap-2">
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {entry.ensName ?? entry.displayName}
                            </p>
                            <p className="text-xs text-[var(--muted)]">{entry.address}</p>
                            {entry.badges.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {entry.badges.map((badge) => (
                                  <span
                                    key={badge}
                                    className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                                    style={{
                                      borderColor:
                                        "color-mix(in srgb, var(--accent) 20%, transparent)",
                                      background:
                                        "color-mix(in srgb, var(--accent) 10%, transparent)",
                                      color: "var(--accent)",
                                    }}
                                  >
                                    {badgeLabel[badge]}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-[var(--foreground)]">
                          {entry.timesPlayed}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-[var(--foreground)]">
                          {entry.score}
                        </td>
                        <td className="rounded-r-[1.5rem] px-4 py-4 text-sm text-[var(--muted)]">
                          {entry.lastPlayedLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="space-y-6">
              <section
                className="rounded-[2rem] border p-5 sm:p-6"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  boxShadow: "0 12px 26px rgba(0,0,0,0.05)",
                }}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  Your profile
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Wallet + ENS</h2>

                <div
                  className="mt-5 rounded-[1.5rem] border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--background)" }}
                >
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                    Connected address
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                    {profile.address ?? "No wallet connected"}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                    One ENS can be linked to only one address.
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={profile.address ? handleDisconnect : handleConnect}
                    className="embed-touch-target inline-flex items-center justify-center rounded-full px-6 text-xs font-semibold uppercase tracking-widest transition duration-300"
                    style={{
                      background: "var(--accent)",
                      color: "var(--background)",
                      boxShadow: "0 10px 24px color-mix(in srgb, var(--accent) 22%, transparent)",
                    }}
                  >
                    {profile.address ? "Disconnect" : "Connect wallet"}
                  </button>

                  <Link
                    href="/app"
                    className="embed-touch-target inline-flex items-center justify-center rounded-full border px-6 text-xs font-semibold uppercase tracking-widest transition duration-300 hover:opacity-90"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    Play again
                  </Link>
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                    Linked ENS
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                    {profile.ensName ?? "Not linked yet"}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <input
                    value={ensInput}
                    onChange={(event) => setEnsInput(event.target.value)}
                    placeholder="yourname.eth"
                    disabled={!canLinkEns}
                    className="embed-touch-target rounded-full border bg-[var(--background)] px-5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <button
                    type="button"
                    onClick={handleLinkEns}
                    disabled={!canLinkEns}
                    className="embed-touch-target inline-flex items-center justify-center rounded-full px-6 text-xs font-semibold uppercase tracking-widest transition duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: canLinkEns ? "var(--accent)" : "var(--muted-bg)",
                      color: canLinkEns ? "var(--background)" : "var(--muted)",
                    }}
                  >
                    Link ENS
                  </button>
                </div>

                {feedback && (
                  <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                    {feedback}
                  </p>
                )}
              </section>

              <section
                className="rounded-[2rem] border p-5 sm:p-6"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  boxShadow: "0 12px 26px rgba(0,0,0,0.05)",
                }}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  Daily status
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  One play per day
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <MetricCard label="Your rank" value={profile.rank ? `#${profile.rank}` : "—"} />
                  <MetricCard label="Total score" value={String(profile.score)} />
                  <MetricCard label="Times played" value={String(profile.timesPlayed)} />
                </div>

                <div
                  className="mt-5 rounded-[1.5rem] border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--background)" }}
                >
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                    {profile.dailyStatus.playedToday
                      ? "Played today"
                      : "Available to play"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {profile.dailyStatus.playedToday
                      ? `Available again in ${countdown}.`
                      : "You can still submit one prediction today."}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                  Demo shell only. Wallet verification, ENS ownership checks, and
                  leaderboard persistence will be connected later.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[1.5rem] border p-4"
      style={{ borderColor: "var(--border)", background: "var(--background)" }}
    >
      <p className="text-xs uppercase tracking-widest text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function getCountdownLabel(nextResetAt: string) {
  const diff = new Date(nextResetAt).getTime() - Date.now();
  if (diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
