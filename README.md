# Predict It!

`Predict It!` is a Next.js prototype for predicting real sports moments before the play resolves. The public site lives at `/` and the interactive game flow lives at `/app`.

The current `/app` experience is a local demo flow powered by the bundled video sets in `public/videos/demo/`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and use **Play** to enter the local demo flow.

## Environment

Copy `.env.example` to `.env.local` and adjust as needed.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used for metadata and share links. |
| `NEXT_PUBLIC_GAME_DEV_HUD` | Shows the dev HUD in production only when set to `true`. In development it is shown unless set to `false`. |
| `NEXT_PUBLIC_ENABLE_LEADERBOARD` | Enables the leaderboard in production only when set to `true`. In development it is shown unless set to `false`. |

## Documentation

- **On-chain PRD**: `docs/onchain-smart-contracts-backend-prd.md`
- **Operational setup**: `docs/operational-setup-guide.md`
- **Manual deploy (Foundry, Arc Testnet)**: `docs/deploy-gameescrow-arc-step-by-step.md`
- **E2E testnet production checklist**: `docs/e2e-checklist-production-testnet.md`
- **Next steps / roadmap**: `docs/next-steps.md`
- **Product feedback notes**: `docs/product-feedback-notes.md`

## Demo assets

This public repo includes six local Messi demo sets.

- Demo assets live under `public/videos/demo/<set-id>/`.
- The game picks one of the registered Messi sets at random each round.
- The app can still fall back to its simulated video flow if a video asset is missing or fails to load.
- You can add more local demo sets later under `public/videos/demo/` without changing the overall structure.

Current demo sets:

```text
public/videos/demo/
  messi-goal-1-left/
  messi-goal-2-right/
  messi-goal-3-right/
  messi-goal-4-right/
  messi-miss-1-left/
  messi-miss-2-right/
```

Each set contains:

```text
public/
  videos/
    demo/
      <set-id>/
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
