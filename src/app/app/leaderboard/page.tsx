import { notFound } from "next/navigation";
import { LeaderboardShell } from "@/features/leaderboard/components/LeaderboardShell";
import { isLeaderboardEnabled } from "@/features/leaderboard/flags";

export default function LeaderboardPage() {
  if (!isLeaderboardEnabled()) {
    notFound();
  }

  return <LeaderboardShell />;
}
