import type { LeaderboardEntry, PlayerProfile } from "../types";

const currentUserAddress = "0x84f2...1c92";

const leaderboardEntries: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0x7ab1...44d0",
    displayName: "0x7ab1...44d0",
    ensName: "penaltyking.eth",
    score: 142,
    timesPlayed: 21,
    lastPlayedLabel: "Today",
    badges: ["top-scorer", "ens-verified"],
  },
  {
    rank: 2,
    address: "0x93ce...fd10",
    displayName: "0x93ce...fd10",
    ensName: "leftcorner.eth",
    score: 131,
    timesPlayed: 19,
    lastPlayedLabel: "Today",
    badges: ["daily-winner", "ens-verified"],
  },
  {
    rank: 3,
    address: "0x51dd...82e4",
    displayName: "0x51dd...82e4",
    ensName: "goalreader.eth",
    score: 118,
    timesPlayed: 17,
    lastPlayedLabel: "1 day ago",
    badges: ["ens-verified"],
  },
  {
    rank: 4,
    address: "0x4e20...8f13",
    displayName: "0x4e20...8f13",
    ensName: null,
    score: 94,
    timesPlayed: 16,
    lastPlayedLabel: "2 days ago",
    badges: [],
  },
  {
    rank: 5,
    address: currentUserAddress,
    displayName: currentUserAddress,
    ensName: null,
    score: 88,
    timesPlayed: 12,
    lastPlayedLabel: "Today",
    badges: [],
    isCurrentUser: true,
  },
  {
    rank: 6,
    address: "0x10ef...4a61",
    displayName: "0x10ef...4a61",
    ensName: "messiwatch.eth",
    score: 84,
    timesPlayed: 11,
    lastPlayedLabel: "Today",
    badges: ["ens-verified"],
  },
  {
    rank: 7,
    address: "0x8ddf...0eb2",
    displayName: "0x8ddf...0eb2",
    ensName: null,
    score: 72,
    timesPlayed: 10,
    lastPlayedLabel: "3 days ago",
    badges: [],
  },
];

const playerProfile: PlayerProfile = {
  address: currentUserAddress,
  ensName: null,
  score: 88,
  timesPlayed: 12,
  rank: 5,
  dailyStatus: {
    playedToday: true,
    nextResetAt: getNextUtcMidnight(),
  },
};

export function getMockLeaderboardEntries() {
  return leaderboardEntries.map((entry) => ({ ...entry, badges: [...entry.badges] }));
}

export function getMockPlayerProfile() {
  return {
    ...playerProfile,
    dailyStatus: { ...playerProfile.dailyStatus },
  };
}

export function getReservedEnsNames() {
  return leaderboardEntries
    .map((entry) => entry.ensName)
    .filter((value): value is string => Boolean(value));
}

function getNextUtcMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next.toISOString();
}
