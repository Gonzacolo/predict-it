# Deploy manual: GameEscrow en Arc Testnet (Foundry)

Guía **solo para ejecutar vos** desde la terminal: fondeo, deploy, configuración de clips y variables de la app. Contexto general en [GUIA_CONFIGURACION_OPERATIVA.md](./GUIA_CONFIGURACION_OPERATIVA.md).

**Raíz de comandos:** siempre el directorio raíz del repo (`predict-it/`), donde está `foundry.toml`.

---

## 0. Qué vas a necesitar

| Necesitás | Para qué |
|-----------|----------|
| [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge --version`) | Compilar y scripts |
| Una wallet con saldo en **Arc Testnet** (gas) | Firmar deploy y configure |
| [Circle Faucet](https://faucet.circle.com/) → red **Arc Testnet** | Fondear esa wallet |
| Decidir **dos roles** (pueden ser la misma cuenta) | Ver paso 1 |

Constantes de red (comprobar en [docs Arc](https://docs.arc.network/) si cambian):

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network` (en el repo también está el alias `arc-testnet` en `foundry.toml`)
- USDC (ERC-20, 6 decimales): `0x3600000000000000000000000000000000000000`

---

## 1. Elegir cuentas (importante)

- **`PRIVATE_KEY` en Foundry** = quien **firma** la transacción (paga gas). En el **deploy** suele ser la misma persona que corre `forge script`.
- **`GAME_ESCROW_OWNER`** = dirección `0x…` que el contrato guardará como **`owner`** (solo esa cuenta puede `settle`, `setClip`, `fundBankroll` vía funciones owner).

Recomendación práctica: usá **la misma cuenta** para deployer y owner si no tenés un motivo para separarlas. Entonces:

- `GAME_ESCROW_OWNER` = dirección pública derivada de la misma clave que `GAME_ESCROW_OWNER_PRIVATE_KEY` en Vercel (la del settle en el backend).

Si el deployer **no** es el owner: el deploy igual funciona; pero para el paso **Configure** tenés que poner `PRIVATE_KEY` del **owner**, no del deployer.

**No subas `PRIVATE_KEY` a Git.** Usá `export` en la terminal o un archivo local fuera del repo.

---

## 2. Fondear la wallet

1. Abrí [Circle Faucet](https://faucet.circle.com/).
2. Elegí **Arc Testnet** y pedí fondos a la dirección que vas a usar como deployer (y owner, si es la misma).
3. Esperá confirmación; sin saldo nativo, `forge script --broadcast` falla con error de fondos insuficientes.

---

## 3. Compilar

```bash
cd /ruta/al/predict-it
forge build
```

Si falla, revisá que Foundry esté instalado y que estés en la carpeta correcta.

---

## 4. Deploy de `GameEscrow`

### 4.1 Variables (terminal zsh/bash)

Sustituí los valores entre `<…>`:

```bash
export PRIVATE_KEY=0x<TU_CLAVE_PRIVADA_SIN_COMILLAS>
export GAME_USDC_ADDRESS=0x3600000000000000000000000000000000000000
export GAME_ESCROW_OWNER=0x<DIRECCION_OWNER_misma_que_settle_si_es_la_misma_cuenta>
export GAME_HOUSE_FEE_BPS=100
```

- `GAME_HOUSE_FEE_BPS=100` → comisión casa 1% (100 de 10000 bps).

### 4.2 Ejecutar el script

```bash
forge script contracts/script/DeployGameEscrow.s.sol:DeployGameEscrowScript \
  --rpc-url arc-testnet \
  --broadcast \
  -vvvv
```

### 4.3 Anotar la dirección del contrato

- En la salida de `forge` buscá la dirección del contrato desplegado (`Deployed to: 0x…`), o
- Abrí `broadcast/DeployGameEscrow.s.sol/5042002/run-latest.json` y leé el `contractAddress` del deployment de `GameEscrow`.

Guardá esa dirección: la vas a usar como `GAME_ESCROW_ADDRESS` y como `NEXT_PUBLIC_GAME_ESCROW_ADDRESS`.

---

## 5. Variables de la app (local y Vercel)

En tu `.env.local` (local) y en **Vercel → Settings → Environment Variables** (producción/preview):

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` | La dirección del paso 4.3 |
| `NEXT_PUBLIC_USDC_ADDRESS` | `0x3600000000000000000000000000000000000000` |
| `NEXT_PUBLIC_CHAIN_ID` | `5042002` |
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.testnet.arc.network` |
| `GAME_ESCROW_OWNER_PRIVATE_KEY` | Clave del **owner** del contrato; en este proyecto debe ser **hex con prefijo `0x`** (véase `src/lib/server/gameWallets.ts`). |

Tras cambiar variables en Vercel: **Redeploy**.

Más detalle en [`.env.example`](../.env.example) y en la tabla de [GUIA_CONFIGURACION_OPERATIVA.md](./GUIA_CONFIGURACION_OPERATIVA.md#4-tabla-de-variables-de-entorno).

---

## 6. Configurar bankroll y clips (`ConfigureGameEscrow`)

El script [`contracts/script/ConfigureGameEscrow.s.sol`](../contracts/script/ConfigureGameEscrow.s.sol) hace **una** corrida: opcionalmente `approve` + `fundBankroll`, y un `setClip` para **un** `clipId`.

- **`PRIVATE_KEY`**: tiene que ser la del **owner** del contrato.
- **`GAME_BANKROLL_AMOUNT`**: unidades en **6 decimales** (1 USDC = `1000000`). Si no querés fondear bankroll en esa corrida, usá `0` (solo `setClip`).
- Si `GAME_BANKROLL_AMOUNT > 0`: el owner necesita **USDC** en Arc y el script hace `approve` al escrow en la misma ejecución.

### 6.1 Valores fijos para cada corrida

```bash
export PRIVATE_KEY=0x<CLAVE_DEL_OWNER>
export GAME_ESCROW_ADDRESS=0x<CONTRATO_DEL_PASO_4>
export GAME_USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

Ejemplo de bankroll 50 USDC en la **primera** corrida (opcional; ajustá el monto):

```bash
export GAME_BANKROLL_AMOUNT=50000000
```

Para corridas siguientes solo con `setClip` (sin tocar bankroll):

```bash
export GAME_BANKROLL_AMOUNT=0
```

### 6.2 Tabla de clips (alineada con `result.json` del repo)

Estos valores ya coinciden con los archivos `public/videos/demo/<carpeta>/result.json` y con `ONCHAIN_CLIP_ID_BY_DEMO_SET` en `src/app/app/config.ts`. **Left = 0**, **Right = 1**; **Goal = 0**, **Miss = 1**.

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

### 6.3 Ejemplo: configurar el clip `5` sin bankroll extra

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

Repetí **seis veces** (o las que necesites), cambiando solo `GAME_DEFAULT_CLIP_ID` y los cuatro valores de dirección/resultado según la tabla.

### 6.4 Primera corrida con bankroll

Si querés depositar bankroll **una sola vez** en la primera ejecución:

```bash
export GAME_BANKROLL_AMOUNT=50000000   # 50 USDC; ajustá
export GAME_DEFAULT_CLIP_ID=1
export GAME_DEFAULT_CLIP_ENABLED=true
export GAME_DEFAULT_CLIP_DIRECTION=0
export GAME_DEFAULT_CLIP_OUTCOME=1

forge script contracts/script/ConfigureGameEscrow.s.sol:ConfigureGameEscrowScript \
  --rpc-url arc-testnet \
  --broadcast \
  -vvvv
```

Luego para los clips `2`…`6` usá `GAME_BANKROLL_AMOUNT=0` y la tabla.

---

## 7. Comprobar en el explorador

- [ArcScan testnet](https://testnet.arcscan.app): buscá la dirección del `GameEscrow`.
- Verificá que existan transacciones de deploy y de `setClip` / `fundBankroll` si aplica.

---

## 8. Checklist rápido

- [ ] Wallet fondeada en Arc Testnet (faucet).
- [ ] `forge build` OK.
- [ ] Deploy con `DeployGameEscrow` y dirección anotada.
- [ ] `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` y USDC actualizados (local + Vercel).
- [ ] `GAME_ESCROW_OWNER_PRIVATE_KEY` coincide con el `owner` del contrato.
- [ ] Configure ejecutado para los **6** clips con la tabla del paso 6.2 (o los que uses en la app).
- [ ] Bankroll suficiente para las apuestas $1 / $10 / $25 (si no, `play` puede revertir `InsolventBankroll`).

---

## Enlaces

- Guía operativa amplia: [GUIA_CONFIGURACION_OPERATIVA.md](./GUIA_CONFIGURACION_OPERATIVA.md)
- Variables de ejemplo: [`.env.example`](../.env.example)
- Direcciones oficiales Arc: [Contract addresses](https://docs.arc.network/arc/references/contract-addresses.md)
