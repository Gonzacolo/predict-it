/** Target for “Play again” after a successful claim (full URL on production deploy). */
const DEFAULT_PLAY_AGAIN =
  "https://predict-it-one.vercel.app/app";

export function getPlayAgainHref(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PLAY_AGAIN_URL?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_PLAY_AGAIN;
}
