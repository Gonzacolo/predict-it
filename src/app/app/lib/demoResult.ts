import type { Direction, Outcome } from "../config";

type RawDirection = "Left" | "Right";
type RawScore = "Goal" | "Miss";

export type DemoVideoResultMetadata = {
  id: number;
  direction: RawDirection;
  score: RawScore;
};

export type DemoVideoResult = {
  id: number;
  direction: Direction;
  outcome: Outcome;
};

export const DEFAULT_DEMO_VIDEO_RESULT: DemoVideoResult = {
  id: 1,
  direction: "left",
  outcome: "miss",
};

function normalizeDirection(direction: RawDirection): Direction {
  return direction === "Left" ? "left" : "right";
}

function normalizeScore(score: RawScore): Outcome {
  return score === "Goal" ? "goal" : "miss";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseDemoVideoResult(
  value: unknown
): DemoVideoResult | null {
  if (!isRecord(value)) return null;

  const { id, direction, score } = value;

  if (typeof id !== "number" || !Number.isFinite(id)) return null;
  if (direction !== "Left" && direction !== "Right") return null;
  if (score !== "Goal" && score !== "Miss") return null;

  return {
    id,
    direction: normalizeDirection(direction),
    outcome: normalizeScore(score),
  };
}

export async function loadDemoVideoResult(
  resultSrc: string,
  fallback: DemoVideoResult = DEFAULT_DEMO_VIDEO_RESULT
): Promise<DemoVideoResult> {
  try {
    const response = await fetch(resultSrc, { cache: "no-store" });
    if (!response.ok) return fallback;

    const parsed = parseDemoVideoResult(await response.json());
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}
