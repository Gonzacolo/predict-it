/**
 * Opens X (Twitter) compose with a pre-filled Predict It! template.
 * @see https://developer.x.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent-api
 */
export function openPredictItTweetIntent(input: {
  won: boolean;
  /** e.g. "Left + Goal" */
  userPick: string | null;
  /** e.g. "Left + Goal" — actual outcome */
  actualOutcome: string;
  winningsUsdc?: number;
  /** Public link to the game (e.g. https://yoursite.com/app) */
  appUrl: string;
}): void {
  const pick = input.userPick ?? "—";
  const text = input.won
    ? `I got it right on Predict It!: ${pick} (+${input.winningsUsdc ?? 0} USDC).`
    : `I played Predict It! I picked ${pick}, and the result was ${input.actualOutcome}.`;

  const params = new URLSearchParams();
  params.set("text", text);
  if (input.appUrl) {
    params.set("url", input.appUrl);
  }
  params.set("hashtags", "PredictIt,EthCC");

  const url = `https://twitter.com/intent/tweet?${params.toString()}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Link that gets appended to the tweet (current origin + /app, or NEXT_PUBLIC_SITE_URL). */
export function getDefaultAppShareUrl(): string {
  if (typeof window !== "undefined") {
    return new URL("/app", window.location.origin).href;
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return base ? `${base}/app` : "";
}
