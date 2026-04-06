export type Direction = "left" | "right";
export type Outcome = "goal" | "miss";
export type DemoVideoResult = {
  direction: Direction;
  outcome: Outcome;
};

export type DemoVideoSet = {
  id: string;
  beforeSrc: string;
  afterSrc: string;
  fullSrc: string;
  previewSrc: string;
  result: DemoVideoResult;
  /** Optional static poster in public/ (empty = none) */
  poster: string;
};

/**
 * Local demo videos are optional in this public repo.
 * When the .mp4 files are missing, the app falls back to the simulated flow.
 */
export const DEMO_VIDEO_SETS = {
  "set-01": {
    id: "set-01",
    beforeSrc: "/videos/demo/set-01/before.mp4",
    afterSrc: "/videos/demo/set-01/after.mp4",
    fullSrc: "/videos/demo/set-01/full.mp4",
    previewSrc: "/videos/demo/set-01/full.mp4",
    result: { direction: "left", outcome: "miss" },
    poster: "",
  },
  "set-02": {
    id: "set-02",
    beforeSrc: "/videos/demo/set-02/before.mp4",
    afterSrc: "/videos/demo/set-02/after.mp4",
    fullSrc: "/videos/demo/set-02/full.mp4",
    previewSrc: "/videos/demo/set-02/full.mp4",
    result: { direction: "left", outcome: "goal" },
    poster: "",
  },
  "set-03": {
    id: "set-03",
    beforeSrc: "/videos/demo/set-03/before.mp4",
    afterSrc: "/videos/demo/set-03/after.mp4",
    fullSrc: "/videos/demo/set-03/full.mp4",
    previewSrc: "/videos/demo/set-03/full.mp4",
    result: { direction: "right", outcome: "goal" },
    poster: "",
  },
  "set-04": {
    id: "set-04",
    beforeSrc: "/videos/demo/set-04/before.mp4",
    afterSrc: "/videos/demo/set-04/after.mp4",
    fullSrc: "/videos/demo/set-04/full.mp4",
    previewSrc: "/videos/demo/set-04/full.mp4",
    result: { direction: "right", outcome: "goal" },
    poster: "",
  },
  "set-05": {
    id: "set-05",
    beforeSrc: "/videos/demo/set-05/before.mp4",
    afterSrc: "/videos/demo/set-05/after.mp4",
    fullSrc: "/videos/demo/set-05/full.mp4",
    previewSrc: "/videos/demo/set-05/full.mp4",
    result: { direction: "right", outcome: "goal" },
    poster: "",
  },
  "set-06": {
    id: "set-06",
    beforeSrc: "/videos/demo/set-06/before.mp4",
    afterSrc: "/videos/demo/set-06/after.mp4",
    fullSrc: "/videos/demo/set-06/full.mp4",
    previewSrc: "/videos/demo/set-06/full.mp4",
    result: { direction: "right", outcome: "miss" },
    poster: "",
  },
} as const satisfies Record<string, DemoVideoSet>;

export type DemoVideoSetId = keyof typeof DEMO_VIDEO_SETS;

/**
 * On-chain `clipId` per demo set. Must match `setClip` on the deployed escrow
 * (same outcome as each configured set result).
 */
export const ONCHAIN_CLIP_ID_BY_DEMO_SET: Record<DemoVideoSetId, bigint> = {
  "set-01": BigInt(1),
  "set-02": BigInt(2),
  "set-03": BigInt(3),
  "set-04": BigInt(4),
  "set-05": BigInt(5),
  "set-06": BigInt(6),
};

export const DEMO_VIDEO_SET_IDS = Object.keys(DEMO_VIDEO_SETS) as DemoVideoSetId[];

export const ACTIVE_DEMO_SET_ID: DemoVideoSetId = "set-01";

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
export const LANDING_EXPLAINER_VIDEO_SRC = "/videos/landing/explainer.mp4";

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
