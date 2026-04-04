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
export const DEMO_VIDEO_SETS: Record<string, DemoVideoSet> = {
  "messi-1": {
    id: "messi-1",
    beforeSrc: "/videos/demo/messi-1/before.mp4",
    afterSrc: "/videos/demo/messi-1/after.mp4",
    fullSrc: "/videos/demo/messi-1/full.mp4",
    previewSrc: "/videos/demo/messi-1/full.mp4",
    resultSrc: "/videos/demo/messi-1/result.json",
    poster: "",
  },
};

export const ACTIVE_DEMO_SET_ID = "messi-1";

export function getDemoVideoSet(setId: string): DemoVideoSet {
  return DEMO_VIDEO_SETS[setId] ?? DEMO_VIDEO_SETS[ACTIVE_DEMO_SET_ID];
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
  /** Tiempo aproximado (segundos) para la intro simulada si faltan assets. */
  SIMULATED_INTRO_SECONDS: 4.5,
  /** Tiempo total (segundos) para completar los 3 pasos de predicción */
  PREDICTION_TOTAL_SECONDS: 10,
  WINNINGS_AMOUNT: 10,
} as const;

export type PredictionChoice = {
  direction: Direction;
  outcome: Outcome;
};
