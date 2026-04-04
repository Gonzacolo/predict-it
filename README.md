# Predict It!

`Predict It!` is a Next.js prototype for predicting real sports moments before the play resolves. The public site lives at `/` and the interactive game flow lives at `/app`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and use **Play** to enter the demo flow.

## Environment

Copy `.env.example` to `.env.local` and adjust as needed.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used for metadata and share links. |
| `NEXT_PUBLIC_GAME_DEV_HUD` | Shows the dev HUD in production only when set to `true`. In development it is shown unless set to `false`. |
| `NEXT_PUBLIC_ENABLE_LEADERBOARD` | Enables the leaderboard in production only when set to `true`. In development it is shown unless set to `false`. |

## Demo assets

This public repo intentionally does **not** include the local `.mp4` demo videos used during development.

- If the videos are missing, the app automatically falls back to its simulated video flow.
- The demo outcome still comes from `public/videos/demo/messi-1/result.json`.
- You can add local video assets later under `public/videos/demo/messi-1/` without changing the code structure.

Expected optional local files:

```text
public/
  videos/
    demo/
      messi-1/
        before.mp4
        after.mp4
        full.mp4
        result.json
```

Example `result.json`:

```json
{
  "id": 1,
  "direction": "Left",
  "score": "Miss"
}
```

You can also configure a poster image or swap the active demo set in `src/app/app/config.ts`.

## Social preview

`src/app/opengraph-image.tsx` generates the Open Graph image dynamically.

## Stack

Next.js 16, React 19, Tailwind CSS 4, Framer Motion, TypeScript.
