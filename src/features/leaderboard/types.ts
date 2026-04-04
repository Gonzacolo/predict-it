export type LeaderboardBadge = "daily-winner" | "top-scorer" | "ens-verified";

export type LeaderboardEntry = {
  rank: number;
  address: string;
  displayName: string;
  ensName: string | null;
  score: number;
  timesPlayed: number;
  lastPlayedLabel: string;
  badges: LeaderboardBadge[];
  isCurrentUser?: boolean;
};

export type DailyPlayStatus = {
  playedToday: boolean;
  nextResetAt: string;
};

export type PlayerProfile = {
  address: string | null;
  ensName: string | null;
  score: number;
  timesPlayed: number;
  rank: number | null;
  dailyStatus: DailyPlayStatus;
};
