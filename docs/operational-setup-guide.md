# Operational setup guide (no code changes required)

This guide describes **what must be configured outside the code**: accounts, Vercel, environment variables, Dynamic, Arc Testnet, contract deployment, and wallets. The detailed architecture is in [onchain-smart-contracts-backend-prd.md](./onchain-smart-contracts-backend-prd.md).

---

## 1. Prerequisites

| What you need | What for |
|---------------|----------|
| A **GitHub** account | The project code lives there. |
| A **Vercel** account (or other Next.js-compatible hosting) | Publish the app to a URL (production / previews). |
| A **Dynamic** account ([app.dynamic.xyz](https://app.dynamic.xyz)) | Embedded wallets and user login for the on-chain game. |
| **Arc Testnet** | Test network: chain id `5042002`, RPC `https://rpc.testnet.arc.network`, USDC `0x3600000000000000000000000000000000000000` — **verify** against [Arc docs](https://docs.arc.network/) and [contract addresses](https://docs.arc.network/arc/references/contract-addresses.md). On testnet, fund the **deployer** wallet via the [Circle Faucet](https://faucet.circle.com/) (Arc Testnet). On Arc, gas is paid with the network’s native asset (don’t assume “Sepolia ETH”). |
| **Foundry** (on the machine that deploys) | Only if you will deploy or reconfigure contracts with the repo scripts (`forge script`). |
| A person with access to **testnet private keys** | Operator (USDC faucet via API) and escrow owner (settlement). **Never** upload those keys to GitHub. |

---

## 2. Demo mode vs on-chain mode in the app

- If **`NEXT_PUBLIC_GAME_ONCHAIN_ENABLED`** is `false` or **missing** in Vercel, `/app` runs as a **local simulated demo** (no real contract, Dynamic not required to play the simulated flow).
- If you set it to **`true`**, the app requires:
  - `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID`
  - Valid addresses for `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` and `NEXT_PUBLIC_USDC_ADDRESS` (not the zero address).
  - On the Vercel server: `GAME_OPERATOR_PRIVATE_KEY` and `GAME_ESCROW_OWNER_PRIVATE_KEY`.

If anything above is missing, `/app` shows a configuration message instead of the on-chain game.

---

## 3. Vercel (or similar hosting)

1. **Connect the GitHub repo** to your Vercel project.
2. Set the **Production** branch (usually `main`): every merge deploys the production URL.
3. Open **Settings → Environment Variables** and set the variables (see the table below).
4. Important distinction:
   - Variables starting with **`NEXT_PUBLIC_`** are embedded in the **browser bundle** (anyone can see them). Only put network + contract addresses there—never private keys.
   - The rest are **server secrets**: only used by the backend (`/api/game/*` routes).
5. After changing variables, **redeploy** the latest deployment (or push an empty commit) so changes take effect.

Optional: use different values for **Preview** (PR deployments) vs **Production** (main) to avoid mixing contracts between environments.

---

## 4. Tabla de variables de entorno

Reference aligned with [`.env.example`](../.env.example) at the repo root.

| Variable | Where? | Required when… | What it is |
|----------|--------|----------------|------------|
| `NEXT_PUBLIC_SITE_URL` | Public | Recommended in prod | Canonical site URL (e.g. `https://your-project.vercel.app`). |
| `NEXT_PUBLIC_GAME_DEV_HUD` | Public | Optional | Dev HUD for the game; in production it’s usually omitted or `false`. |
| `NEXT_PUBLIC_GAME_ONCHAIN_ENABLED` | Public | For real testnet gameplay | `true` enables Dynamic + on-chain contract; `false` or missing keeps demo mode. |
| `NEXT_PUBLIC_CHAIN_ID` | Public | On-chain | Chain ID, e.g. `5042002` for Arc Testnet (confirm with Arc). |
| `NEXT_PUBLIC_RPC_URL` | Public | On-chain | HTTP RPC URL used by the client (must match the chain). |
| `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` | Public | On-chain | Deployed `GameEscrow` contract address (not `0x000…000`). |
| `NEXT_PUBLIC_USDC_ADDRESS` | Public | On-chain | USDC token address on that network (the same used at deploy time). |
| `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` | Public | On-chain | Environment ID from the Dynamic dashboard. |
| `GAME_OPERATOR_PRIVATE_KEY` | **Secret** | On-chain | Private key of the wallet that **sends USDC** to players via `POST /api/game/fund`. Must have testnet USDC and Arc native balance for gas (see faucet above). |
| `GAME_ESCROW_OWNER_PRIVATE_KEY` | **Secret** | On-chain | Private key of the **contract owner** for `GameEscrow` (the account allowed to `settle`). Must match the on-chain `owner` address. |
| `DYNAMIC_API_KEY` | **Secret** | Optional | Dynamic REST API key; currently used for SDK wiring / future extensions. The MVP faucet uses the operator wallet with viem and does not replace `GAME_OPERATOR_PRIVATE_KEY`. |
| `NEXT_PUBLIC_BLOCK_EXPLORER_URL` | Public | Optional | Base block-explorer URL for “view transaction” links (no trailing slash). By default, the app uses Arc Testnet’s explorer URL defined in code (`testnet.arcscan.app`). |

---

## 5. Dynamic

1. Create a **project** and an **environment** (staging/prod—your choice).
2. Copy the **Environment ID** into `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` in Vercel.
3. In the Dynamic project settings, make sure **Arc Testnet** is allowed for EVM wallets (same chain id/network as `NEXT_PUBLIC_CHAIN_ID` and Arc docs).
4. The app adds Arc to the client via SDK overrides (`GameDynamicProvider`), but it’s still best to have the network recognized in the Dynamic dashboard to reduce friction.
5. **Allowed domains and URLs (critical in production):** in the Dynamic dashboard, add your public Vercel URL (e.g. `https://your-app.vercel.app`) and, if you use a custom domain, add that too. Include **Preview** if you test PR deployments (each preview has its own URL; Dynamic may require explicit lists or wildcards depending on plan). Without this, the widget may fail in prod and only work on `localhost`.
6. After changing domains in Dynamic, test login / wallet connection on the real URL (not only locally).

---

## 6. Contratos en Arc Testnet (proceso operativo)

**Step-by-step terminal guide + checklist:** [deploy-gameescrow-arc-step-by-step.md](./deploy-gameescrow-arc-step-by-step.md).

Recommended order for the person running the scripts (Foundry), with a wallet **funded on Arc Testnet** (gas) and the env vars exported in their shell (see also [`.env.example`](../.env.example), Foundry block).

**Account roles:** `PRIVATE_KEY` (or `--private-key`) is the account that **signs and pays for deploy**. `GAME_ESCROW_OWNER` is the on-chain contract `owner`; it should be the same address derived from `GAME_ESCROW_OWNER_PRIVATE_KEY` in Vercel, or another account you control for `settle` / `setClip`.

1. **USDC**  
   Use the official USDC address on Arc Testnet (see Arc docs / PRD).

2. **Compile** (from the repo root):

   ```bash
   forge build
   ```

3. **Deploy `GameEscrow`**  
   Script: `contracts/script/DeployGameEscrow.s.sol`.  
   Environment variables expected by the script:
   - `PRIVATE_KEY` — deployer (secret; do not commit).
   - `GAME_USDC_ADDRESS`
   - `GAME_ESCROW_OWNER` (address that becomes the contract `owner` — should be the same address you’ll later use via `GAME_ESCROW_OWNER_PRIVATE_KEY` in Vercel, or another account you control).
   - `GAME_HOUSE_FEE_BPS` (e.g. `100` = 1%; max 10000).

   Command (the `arc-testnet` alias is defined in [`foundry.toml`](../foundry.toml)):

   ```bash
   forge script contracts/script/DeployGameEscrow.s.sol:DeployGameEscrowScript \
     --rpc-url arc-testnet \
     --broadcast \
     -vvvv
   ```

   The contract address appears in stdout and under `broadcast/DeployGameEscrow.s.sol/5042002/` (repo root; ignored by git).

4. **Record** the newly deployed contract address → set `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` (local and Vercel) and redeploy the app.

5. **Configure bankroll and clips**  
   Script: `contracts/script/ConfigureGameEscrow.s.sol`.  
   Variables:
   - `PRIVATE_KEY` — must be the contract **owner** key (same account as `GAME_ESCROW_OWNER_PRIVATE_KEY` in Vercel).
   - `GAME_ESCROW_ADDRESS`
   - `GAME_USDC_ADDRESS`
  - `GAME_BANKROLL_AMOUNT` (token units with 6 decimals; e.g. `50000000` = 50 USDC when 1 USDC = 1e6 units)
  - For each clip you want to activate in a script run:
     - `GAME_DEFAULT_CLIP_ID`
     - `GAME_DEFAULT_CLIP_ENABLED` (`true` / `false`)
    - `GAME_DEFAULT_CLIP_DIRECTION`: in the contract, **Left = 0**, **Right = 1**
     - `GAME_DEFAULT_CLIP_OUTCOME`: **Goal = 0**, **Miss = 1**

   The script configures **one clip per execution**. You must run it **once for each `clipId`** used by the app, with the result matching the corresponding video’s `result.json`. The signer must be the escrow **owner** and, if `GAME_BANKROLL_AMOUNT > 0`, the owner must have USDC and the script will do `approve` + `fundBankroll` in that same run.

   ```bash
   forge script contracts/script/ConfigureGameEscrow.s.sol:ConfigureGameEscrowScript \
     --rpc-url arc-testnet \
     --broadcast \
     -vvvv
   ```

6. **Clip ↔ video mapping (must match)**  
   In code, ids are in `ONCHAIN_CLIP_ID_BY_DEMO_SET` (`src/app/app/config.ts`):

   | On-chain ID | Demo set (folder under `public/videos/demo/`) |
   |------------|-----------------------------------------------|
   | 1 | `messi-miss-1-left` |
   | 2 | `messi-goal-1-left` |
   | 3 | `messi-goal-2-right` |
   | 4 | `messi-goal-3-right` |
   | 5 | `messi-goal-4-right` |
   | 6 | `messi-miss-2-right` |

   For each one, open that set’s `result.json`:
   - `direction`: `"Left"` → `0`, `"Right"` → `1`
   - `score`: `"Goal"` → `0`, `"Miss"` → `1`

   If on-chain config does not match the video, the UI may look correct but the contract will calculate a different payout.

7. **Solvency**  
   If the bankroll doesn’t cover the worst-case payouts, `play` will fail (`InsolventBankroll`). Increase `fundBankroll` (or the configure amount) until $1 / $10 / $25 playthroughs succeed.

---

## 7. Wallets (testnet)

| Role | Requirements | Where it’s used |
|------|--------------|------------------|
| **Operator** | Testnet USDC (to fund players, ~3× stake per round in the current API) + Arc native balance for gas | `GAME_OPERATOR_PRIVATE_KEY` → `/api/game/fund` |
| **Escrow owner** | Must match the `GameEscrow` on-chain `owner` exactly | `GAME_ESCROW_OWNER_PRIVATE_KEY` → `/api/game/settle` |

Recommendation: document (internally—Notion, etc.) the **public addresses** for these accounts and the contract’s **block explorer link**, without storing private keys there.

---

## 8. Final checklist before you consider “testnet production” ready

- [ ] Vercel has all variables from the table set, and you **redeployed** after each change.
- [ ] `NEXT_PUBLIC_SITE_URL` = the canonical production URL (consistent metadata and links).
- [ ] Dynamic: correct Environment ID, Arc network usable, and **production (and preview, if applicable) domains/URLs** allowed in the dashboard.
- [ ] Contract deployed, bankroll funded, and **all 6 clips** configured to match `result.json`.
- [ ] Operator wallet has enough testnet USDC and Arc native balance for gas.
- [ ] Contract owner matches the secret settle key.
- [ ] Test on the public URL: choose wager → Play (should trigger funding) → complete prediction and sign → watch video → at the end, automatic settle via API → if applicable, claim.

**If something fails**, check in this order: on-screen message (error banner in `/app`) → Vercel function logs (structured JSON in `/api/game/*`) → `NEXT_PUBLIC_*` points to the correct contract → operator USDC/gas balances → escrow bankroll → `setClip` vs video JSON → Dynamic allowed domains and Arc network settings.

---

## Useful links

- PRD: [onchain-smart-contracts-backend-prd.md](./onchain-smart-contracts-backend-prd.md)
- Example variables: [`.env.example`](../.env.example)
- Next steps: [next-steps.md](./next-steps.md)
- E2E checklist: [e2e-checklist-production-testnet.md](./e2e-checklist-production-testnet.md)
