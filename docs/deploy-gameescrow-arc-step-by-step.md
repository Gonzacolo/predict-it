# Manual deploy: GameEscrow on Arc Testnet (Foundry)

This guide is **for you to run locally** from the terminal: funding, deploy, clip configuration, and app env vars. Broader context: [operational-setup-guide.md](./operational-setup-guide.md).

**Command root:** always run from the repository root (`predict-it/`), where `foundry.toml` lives.

---

## 0. What you’ll need

| You need | What for |
|-----------|----------|
| [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge --version`) | Compile + scripts |
| A wallet funded on **Arc Testnet** (gas) | Sign deploy + configure |
| [Circle Faucet](https://faucet.circle.com/) → **Arc Testnet** | Fund that wallet |
| Decide **two roles** (can be the same account) | See step 1 |

Network constants (double-check in [Arc docs](https://docs.arc.network/) in case they change):

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network` (this repo also defines the `arc-testnet` alias in `foundry.toml`)
- USDC (ERC-20, 6 decimales): `0x3600000000000000000000000000000000000000`

---

## 1. Choose accounts (important)

- **`PRIVATE_KEY` (Foundry)**: the account that **signs** transactions (pays gas). For **deploy**, it’s usually the same person running `forge script`.
- **`GAME_ESCROW_OWNER`**: the `0x…` address the contract will store as **`owner`** (only this account can `settle`, `setClip`, `fundBankroll` via owner-only functions).

Practical recommendation: use **the same account** for deployer and owner unless you have a reason to separate them. Then:

- `GAME_ESCROW_OWNER` = the public address derived from the same key as `GAME_ESCROW_OWNER_PRIVATE_KEY` in Vercel (the one used by the backend to settle).

If the deployer **is not** the owner: deploy still works; but for the **Configure** step you must use the owner’s `PRIVATE_KEY`, not the deployer’s.

**Do not commit `PRIVATE_KEY` to git.** Use `export` in your terminal or a local file outside the repo.

---

## 2. Fund the wallet

1. Open [Circle Faucet](https://faucet.circle.com/).
2. Choose **Arc Testnet** and request funds to the address you’ll use as deployer (and owner, if it’s the same account).
3. Wait for confirmation; without native balance, `forge script --broadcast` fails with “insufficient funds”.

---

## 3. Compile

```bash
cd /path/to/predict-it
forge build
```

If it fails, make sure Foundry is installed and you are in the right folder.

---

## 4. Deploy `GameEscrow`

### 4.1 Variables (zsh/bash)

Replace the values inside `<…>`:

```bash
export PRIVATE_KEY=0x<YOUR_PRIVATE_KEY_NO_QUOTES>
export GAME_USDC_ADDRESS=0x3600000000000000000000000000000000000000
export GAME_ESCROW_OWNER=0x<OWNER_ADDRESS_same_as_settle_if_same_account>
export GAME_HOUSE_FEE_BPS=100
```

- `GAME_HOUSE_FEE_BPS=100` → 1% house fee (100 out of 10000 bps).

### 4.2 Run the script

```bash
forge script contracts/script/DeployGameEscrow.s.sol:DeployGameEscrowScript \
  --rpc-url arc-testnet \
  --broadcast \
  -vvvv
```

### 4.3 Save the contract address

- In the `forge` output, look for the deployed contract address (`Deployed to: 0x…`), or\n+- Open `broadcast/DeployGameEscrow.s.sol/5042002/run-latest.json` and read `contractAddress` for the `GameEscrow` deployment.

Save that address: you’ll use it as `GAME_ESCROW_ADDRESS` and `NEXT_PUBLIC_GAME_ESCROW_ADDRESS`.

---

## 5. App env vars (local and Vercel)

In your `.env.local` (local) and in **Vercel → Settings → Environment Variables** (production/preview):

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` | The address from step 4.3 |
| `NEXT_PUBLIC_USDC_ADDRESS` | `0x3600000000000000000000000000000000000000` |
| `NEXT_PUBLIC_CHAIN_ID` | `5042002` |
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.testnet.arc.network` |
| `GAME_ESCROW_OWNER_PRIVATE_KEY` | The contract **owner** key; in this project it must be **hex with `0x` prefix** (see `src/lib/server/gameWallets.ts`). |

After changing variables in Vercel: **Redeploy**.

More details in [`.env.example`](../.env.example) and in the table in [operational-setup-guide.md](./operational-setup-guide.md#4-environment-variables-table).

---

## 6. Configure bankroll and clips (`ConfigureGameEscrow`)

The script [`contracts/script/ConfigureGameEscrow.s.sol`](../contracts/script/ConfigureGameEscrow.s.sol) does **one** run: optionally `approve` + `fundBankroll`, and `setClip` for **one** `clipId`.

- **`PRIVATE_KEY`**: must be the **contract owner** key.\n+- **`GAME_BANKROLL_AMOUNT`**: units in **6 decimals** (1 USDC = `1000000`). If you don’t want to fund bankroll in that run, use `0` (only `setClip`).\n+- If `GAME_BANKROLL_AMOUNT > 0`: the owner needs **USDC** on Arc and the script runs `approve` to the escrow in the same execution.

### 6.1 Valores fijos para cada corrida

```bash
export PRIVATE_KEY=0x<OWNER_PRIVATE_KEY>
export GAME_ESCROW_ADDRESS=0x<CONTRACT_FROM_STEP_4>
export GAME_USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

Example: 50 USDC bankroll in the **first** run (optional; adjust the amount):

```bash
export GAME_BANKROLL_AMOUNT=50000000
```

For subsequent runs with only `setClip` (no bankroll changes):

```bash
export GAME_BANKROLL_AMOUNT=0
```

### 6.2 Clip table (aligned with repo `result.json`)

These values already match `public/videos/demo/<folder>/result.json` and `ONCHAIN_CLIP_ID_BY_DEMO_SET` in `src/app/app/config.ts`. **Left = 0**, **Right = 1**; **Goal = 0**, **Miss = 1**.

| `GAME_DEFAULT_CLIP_ID` | Carpeta demo | `GAME_DEFAULT_CLIP_DIRECTION` | `GAME_DEFAULT_CLIP_OUTCOME` |
|------------------------|--------------|-------------------------------|-----------------------------|
| `1` | `messi-miss-1-left` | `0` | `1` |
| `2` | `messi-goal-1-left` | `0` | `0` |
| `3` | `messi-goal-2-right` | `1` | `0` |
| `4` | `messi-goal-3-right` | `1` | `0` |
| `5` | `messi-goal-4-right` | `1` | `0` |
| `6` | `messi-miss-2-right` | `1` | `1` |

Siempre:

```bash
export GAME_DEFAULT_CLIP_ENABLED=true
```

### 6.3 Example: configure clip `5` without extra bankroll

```bash
export GAME_BANKROLL_AMOUNT=0
export GAME_DEFAULT_CLIP_ID=5
export GAME_DEFAULT_CLIP_ENABLED=true
export GAME_DEFAULT_CLIP_DIRECTION=1
export GAME_DEFAULT_CLIP_OUTCOME=0

forge script contracts/script/ConfigureGameEscrow.s.sol:ConfigureGameEscrowScript \
  --rpc-url arc-testnet \
  --broadcast \
  -vvvv
```

Repeat **six times** (or as many as you need), changing only `GAME_DEFAULT_CLIP_ID` and the four direction/outcome values according to the table.

### 6.4 First run with bankroll

If you want to deposit bankroll **only once** in the first execution:

```bash
export GAME_BANKROLL_AMOUNT=50000000   # 50 USDC; adjust
export GAME_DEFAULT_CLIP_ID=1
export GAME_DEFAULT_CLIP_ENABLED=true
export GAME_DEFAULT_CLIP_DIRECTION=0
export GAME_DEFAULT_CLIP_OUTCOME=1

forge script contracts/script/ConfigureGameEscrow.s.sol:ConfigureGameEscrowScript \
  --rpc-url arc-testnet \
  --broadcast \
  -vvvv
```

Then, for clips `2`…`6`, use `GAME_BANKROLL_AMOUNT=0` and the table.

---

## 7. Verify in the block explorer

- [ArcScan testnet](https://testnet.arcscan.app): search for the `GameEscrow` address.\n+- Verify that deploy and `setClip` / `fundBankroll` transactions exist (if applicable).

---

## 8. Quick checklist

- [ ] Wallet funded on Arc Testnet (faucet).\n+- [ ] `forge build` OK.\n+- [ ] Deploy done via `DeployGameEscrow` and address recorded.\n+- [ ] `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` and USDC address updated (local + Vercel).\n+- [ ] `GAME_ESCROW_OWNER_PRIVATE_KEY` matches the contract `owner`.\n+- [ ] Configure executed for the **6** clips using the table in step 6.2 (or as many as your app uses).\n+- [ ] Bankroll is sufficient for $1 / $10 / $25 wagers (otherwise `play` may revert with `InsolventBankroll`).

---

## Links

- Operational guide: [operational-setup-guide.md](./operational-setup-guide.md)\n+- Example variables: [`.env.example`](../.env.example)\n+- Arc official addresses: [Contract addresses](https://docs.arc.network/arc/references/contract-addresses.md)
