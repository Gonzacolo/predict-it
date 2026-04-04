const isProd = process.env.NODE_ENV === "production";
const leaderboardFlag = process.env.NEXT_PUBLIC_ENABLE_LEADERBOARD;

export function isLeaderboardEnabled() {
  return isProd ? leaderboardFlag === "true" : leaderboardFlag !== "false";
}
