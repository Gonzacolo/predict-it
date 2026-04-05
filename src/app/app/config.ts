export type Direction = "left" | "right";
export type Outcome = "goal" | "miss";

export type DemoVideoSet = {
  id: string;
  beforeSrc: string;
  afterSrc: string;
  fullSrc: string;
  previewSrc: string;
  resultSrc: string;
  /** Optional static poster in public/ (empty = none) */
  poster: string;
};

/**
 * Local demo videos are optional in this public repo.
 * When the .mp4 files are missing, the app falls back to the simulated flow.
 */
export const DEMO_VIDEO_SETS = {
  "messi-miss-1-left": {
    id: "messi-miss-1-left",
    beforeSrc: "/videos/demo/messi-miss-1-left/before.mp4",
    afterSrc: "/videos/demo/messi-miss-1-left/after.mp4",
    fullSrc: "/videos/demo/messi-miss-1-left/full.mp4",
    previewSrc: "/videos/demo/messi-miss-1-left/full.mp4",
    resultSrc: "/videos/demo/messi-miss-1-left/result.json",
    poster: "",
  },
  "messi-goal-1-left": {
    id: "messi-goal-1-left",
    beforeSrc: "/videos/demo/messi-goal-1-left/before.mp4",
    afterSrc: "/videos/demo/messi-goal-1-left/after.mp4",
    fullSrc: "/videos/demo/messi-goal-1-left/full.mp4",
    previewSrc: "/videos/demo/messi-goal-1-left/full.mp4",
    resultSrc: "/videos/demo/messi-goal-1-left/result.json",
    poster: "",
  },
  "messi-goal-2-right": {
    id: "messi-goal-2-right",
    beforeSrc: "/videos/demo/messi-goal-2-right/before.mp4",
    afterSrc: "/videos/demo/messi-goal-2-right/after.mp4",
    fullSrc: "/videos/demo/messi-goal-2-right/full.mp4",
    previewSrc: "/videos/demo/messi-goal-2-right/full.mp4",
    resultSrc: "/videos/demo/messi-goal-2-right/result.json",
    poster: "",
  },
  "messi-goal-3-right": {
    id: "messi-goal-3-right",
    beforeSrc: "/videos/demo/messi-goal-3-right/before.mp4",
    afterSrc: "/videos/demo/messi-goal-3-right/after.mp4",
    fullSrc: "/videos/demo/messi-goal-3-right/full.mp4",
    previewSrc: "/videos/demo/messi-goal-3-right/full.mp4",
    resultSrc: "/videos/demo/messi-goal-3-right/result.json",
    poster: "",
  },
  "messi-goal-4-right": {
    id: "messi-goal-4-right",
    beforeSrc: "/videos/demo/messi-goal-4-right/before.mp4",
    afterSrc: "/videos/demo/messi-goal-4-right/after.mp4",
    fullSrc: "/videos/demo/messi-goal-4-right/full.mp4",
    previewSrc: "/videos/demo/messi-goal-4-right/full.mp4",
    resultSrc: "/videos/demo/messi-goal-4-right/result.json",
    poster: "",
  },
  "messi-miss-2-right": {
    id: "messi-miss-2-right",
    beforeSrc: "/videos/demo/messi-miss-2-right/before.mp4",
    afterSrc: "/videos/demo/messi-miss-2-right/after.mp4",
    fullSrc: "/videos/demo/messi-miss-2-right/full.mp4",
    previewSrc: "/videos/demo/messi-miss-2-right/full.mp4",
    resultSrc: "/videos/demo/messi-miss-2-right/result.json",
    poster: "",
  },
} as const satisfies Record<string, DemoVideoSet>;

export type DemoVideoSetId = keyof typeof DEMO_VIDEO_SETS;

/**
 * On-chain `clipId` per demo set. Must match `setClip` on the deployed escrow
 * (same outcome as each set's `result.json`).
 */
export const ONCHAIN_CLIP_ID_BY_DEMO_SET: Record<DemoVideoSetId, bigint> = {
  "messi-miss-1-left": BigInt(1),
  "messi-goal-1-left": BigInt(2),
  "messi-goal-2-right": BigInt(3),
  "messi-goal-3-right": BigInt(4),
  "messi-goal-4-right": BigInt(5),
  "messi-miss-2-right": BigInt(6),
};

export const DEMO_VIDEO_SET_IDS = Object.keys(DEMO_VIDEO_SETS) as DemoVideoSetId[];

export const ACTIVE_DEMO_SET_ID: DemoVideoSetId = "messi-miss-1-left";

export function getDemoVideoSet(setId: string): DemoVideoSet {
  if (setId in DEMO_VIDEO_SETS) {
    return DEMO_VIDEO_SETS[setId as DemoVideoSetId];
  }

  return DEMO_VIDEO_SETS[ACTIVE_DEMO_SET_ID];
}

export function getRandomDemoSetId(excludeId?: DemoVideoSetId): DemoVideoSetId {
  const candidateIds =
    excludeId && DEMO_VIDEO_SET_IDS.length > 1
      ? DEMO_VIDEO_SET_IDS.filter((id) => id !== excludeId)
      : DEMO_VIDEO_SET_IDS;

  return (
    candidateIds[Math.floor(Math.random() * candidateIds.length)] ??
    ACTIVE_DEMO_SET_ID
  );
}

export const ACTIVE_DEMO_VIDEO_SET = getDemoVideoSet(ACTIVE_DEMO_SET_ID);

/**
 * Landing page MVP preview: your walkthrough explaining how the product works.
 * Leave "" to keep the placeholder. When ready, add e.g. public/videos/landing/explainer.mp4
 * and set this to "/videos/landing/explainer.mp4".
 */
export const LANDING_EXPLAINER_VIDEO_SRC = "";

/** Optional poster in public/, e.g. "/videos/landing/explainer-poster.jpg" */
export const LANDING_EXPLAINER_POSTER = "";

export const CONFIG = {
  ACTIVE_DEMO_SET_ID,
  ACTIVE_DEMO_VIDEO_SET,
  LANDING_EXPLAINER_VIDEO_SRC,
  LANDING_EXPLAINER_POSTER,
  /** Approximate duration (seconds) of the simulated intro when assets are missing. */
  SIMULATED_INTRO_SECONDS: 4.5,
  /** Total time (seconds) to complete the 3 prediction steps. */
  PREDICTION_TOTAL_SECONDS: 15,
  WINNINGS_AMOUNT: 10,
} as const;

export type PredictionChoice = {
  direction: Direction;
  outcome: Outcome;
};
