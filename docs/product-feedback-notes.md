# Product feedback notes (consolidated)

This file consolidates a set of UX/product feedback notes that were previously kept in a separate exported document. It is intentionally kept as plain markdown so it can live cleanly in the repo.

## Copy under “Play with testnet USDC”

- Refine the English copy to better explain the context and that this is testnet-only.

## Payout explanation (keep it understandable)

- Explain payouts as a prediction-style split:
  - The stake is split **50/50** across two independent legs (direction and outcome).
  - Each leg is resolved against the pool; the total payout is the sum of both legs.
- If we mention “illustrative model odds”, keep them clear and correct:
  - Direction: ~38% left / 62% right
  - Outcome: ~22% miss / 78% goal

## Countdown UI

- Show the countdown inside a pill-sized container.
- Add a glass/blur effect with ~40% opacity to improve readability.

## Claim screen UX

- After the user chooses between connected wallet vs recipient wallet:
  - Only show one CTA: **Claim rewards**
  - Keep the rest of the flow unchanged.

