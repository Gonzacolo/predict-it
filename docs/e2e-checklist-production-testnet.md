# E2E checklist — testnet production (on-chain)

Use this on the **public URL** (Vercel Production) with `NEXT_PUBLIC_GAME_ONCHAIN_ENABLED=true` and the rest of the env vars set. Operational details: [operational-setup-guide.md](./operational-setup-guide.md).

## Minimum flow

1. [ ] Open `/app`, connect a wallet (Dynamic), choose **$1**, **$10**, or **$25**.
2. [ ] **Play** → funding (testnet USDC to the player wallet) completes with no on-screen errors.
3. [ ] After the countdown, at the video pause point: choose direction and outcome → sign **approve + play** in the wallet.
4. [ ] Watch the clip resolve → at the end, **settle** via API (no error); result matches the contract.
5. [ ] If there is claimable payout: **Claim** → sign `claimTo` and see success in the modal.
6. [ ] On the result screen: verify **View in explorer** links (fund, play, settle, claim if applicable) and the **ticket ID** (if shown).

Record for internal support:

- Tx hashes copied from the UI or from network responses (`/api/game/fund`, `/api/game/settle`).
- Explorer: [ArcScan testnet](https://testnet.arcscan.app) (or `NEXT_PUBLIC_BLOCK_EXPLORER_URL` if you set it).

## Preview vs Production (Vercel)

| Environment | Typical URL | `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` | Notes |
|------------|-------------|-----------------------------------|-------|
| Production | `https://<project>.vercel.app` or custom | “Official” demo escrow | What you show at events |
| Preview | `https://<project>-<hash>.vercel.app` | Optional: separate deploy / same contracts | Per-environment vars in Vercel |

- [ ] Production variables complete and redeployed.
- [ ] If you use Preview with on-chain: same keys or a separate set of contracts; document which is which.

## Internal registry (public data only)

| Concept | Address or value | Explorer / note |
|--------|-------------------|-----------------|
| GameEscrow | `0x…` | Contract link in ArcScan |
| USDC testnet | `0x…` | Same network as the escrow |
| Owner (settle) | `0x…` | Must match `GAME_ESCROW_OWNER_PRIVATE_KEY` |
| Operator (fund) | `0x…` | Wallet that sends USDC via the API |

Do not store private keys in this document.

## Optional recording

Record a full run (do not show seed phrases or private keys) to reproduce regressions before demos.
