# Guía de configuración operativa (sin código en el repo)

Esta guía describe **qué hay que configurar fuera del código**: cuentas, Vercel, variables de entorno, Dynamic, Arc Testnet, despliegue de contratos y wallets. La arquitectura detallada está en [Onchain_SmartContracts_Backend_PRD.md](./Onchain_SmartContracts_Backend_PRD.md).

---

## 1. Prerrequisitos

| Qué necesitás | Para qué sirve |
|---------------|----------------|
| Cuenta en **GitHub** | El código del proyecto ya vive ahí. |
| Cuenta en **Vercel** (u otro hosting compatible con Next.js) | Publicar la app en una URL (producción / previews). |
| Cuenta en **Dynamic** ([app.dynamic.xyz](https://app.dynamic.xyz)) | Wallets embebidas y login de usuarios en el juego on-chain. |
| **Arc Testnet** | Red de prueba: chain id `5042002`, RPC `https://rpc.testnet.arc.network`, USDC `0x3600000000000000000000000000000000000000` — **verificá** contra [docs Arc](https://docs.arc.network/) y [contract addresses](https://docs.arc.network/arc/references/contract-addresses.md). En testnet, fondeá la wallet del **deployer** con el [Circle Faucet](https://faucet.circle.com/) (Arc Testnet); en Arc el gas se paga con el activo nativo de la red (no asumas “ETH de Sepolia”). |
| **Foundry** (en una máquina de quien despliega) | Solo si vas a desplegar o reconfigurar contratos con los scripts del repo (`forge script`). |
| Una persona con acceso a **claves privadas** de testnet | Operador (faucet USDC vía API) y owner del escrow (liquidación). **Nunca** subir esas claves a GitHub. |

---

## 2. Modo demo vs modo on-chain en la app

- Si **`NEXT_PUBLIC_GAME_ONCHAIN_ENABLED`** está en `false` o **no existe** en Vercel, la ruta `/app` funciona como **demo local simulada** (sin contrato real, sin Dynamic obligatorio para jugar el flujo simulado).
- Si la pones en **`true`**, la app exige:
  - `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID`
  - Direcciones válidas de `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` y `NEXT_PUBLIC_USDC_ADDRESS` (no la dirección cero).
  - En el servidor de Vercel: `GAME_OPERATOR_PRIVATE_KEY` y `GAME_ESCROW_OWNER_PRIVATE_KEY`.

Si falta algo de lo anterior, la propia `/app` muestra un mensaje de configuración en lugar del juego on-chain.

---

## 3. Vercel (u hosting similar)

1. **Conectar el repositorio** de GitHub al proyecto en Vercel.
2. Definir la rama de **Producción** (normalmente `main`): cada merge despliega la URL de producción.
3. Abrir **Settings → Environment Variables** y cargar las variables (ver tabla abajo).
4. Diferencia importante:
   - Las que empiezan con **`NEXT_PUBLIC_`** se incrustan en el **navegador** (cualquiera puede verlas en el cliente). Ahí solo poné direcciones de contratos y red, nunca claves privadas.
   - El resto son **secretas del servidor**: solo las usa el backend (rutas `/api/game/*`).
5. Tras cambiar variables, hacé **Redeploy** del último deployment (o un commit vacío) para que tomen efecto.

Opcional: definir variables distintas para **Preview** (ramas/PRs) y **Production** (main), para no mezclar contratos de prueba con los de demo pública.

---

## 4. Tabla de variables de entorno

Referencia alineada con [`.env.example`](../.env.example) en la raíz del repo.

| Variable | ¿Dónde? | Obligatoria si… | Qué es |
|----------|---------|-------------------|--------|
| `NEXT_PUBLIC_SITE_URL` | Pública | Recomendada en prod | URL canónica del sitio (ej. `https://tu-proyecto.vercel.app`). |
| `NEXT_PUBLIC_GAME_DEV_HUD` | Pública | Opcional | Panel de desarrollo en el juego; en producción suele omitirse o `false`. |
| `NEXT_PUBLIC_GAME_ONCHAIN_ENABLED` | Pública | Para juego real en testnet | `true` para activar Dynamic + contrato; `false` o ausente para demo. |
| `NEXT_PUBLIC_CHAIN_ID` | Pública | On-chain | ID de cadena; p. ej. `5042002` para Arc Testnet (confirmar con Arc). |
| `NEXT_PUBLIC_RPC_URL` | Pública | On-chain | URL del RPC HTTP que usará el cliente (y debe ser coherente con la cadena). |
| `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` | Pública | On-chain | Dirección del contrato `GameEscrow` desplegado (no `0x000…000`). |
| `NEXT_PUBLIC_USDC_ADDRESS` | Pública | On-chain | Dirección del token USDC en esa red (la misma que usaste al desplegar el escrow). |
| `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` | Pública | On-chain | ID del entorno en el dashboard de Dynamic. |
| `GAME_OPERATOR_PRIVATE_KEY` | **Secreta** | On-chain | Clave de la wallet que **envía USDC** a los jugadores vía `POST /api/game/fund`. Debe tener USDC de testnet y saldo nativo en Arc para gas (ver faucet arriba). |
| `GAME_ESCROW_OWNER_PRIVATE_KEY` | **Secreta** | On-chain | Clave del **owner** del contrato `GameEscrow` (quien puede `settle`). Debe coincidir con la dirección `owner` del contrato desplegado. |
| `DYNAMIC_API_KEY` | **Secreta** | Opcional | API REST de Dynamic; hoy el código la deja preparada para extensiones. El faucet MVP usa la wallet operadora con viem, no sustituye `GAME_OPERATOR_PRIVATE_KEY`. |
| `NEXT_PUBLIC_BLOCK_EXPLORER_URL` | Pública | Opcional | Base del explorador de bloques para enlaces “ver transacción” (sin barra final). Por defecto la app usa la URL de Arc Testnet definida en código (`testnet.arcscan.app`). |

---

## 5. Dynamic

1. Crear un **proyecto** y un **entorno** (staging/prod según tu criterio).
2. Copiar el **Environment ID** a `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID` en Vercel.
3. En la configuración del proyecto en Dynamic, asegurate de que **Arc Testnet** esté permitida para wallets EVM (misma chain id y red que en `NEXT_PUBLIC_CHAIN_ID` / documentación Arc).
4. La app añade la red Arc en el cliente mediante overrides del SDK (`GameDynamicProvider`); igual conviene tener la red reconocida en el dashboard para evitar fricción.
5. **Dominios y URLs permitidas (crítico en producción):** en el dashboard de Dynamic, agregá la URL pública de Vercel (p. ej. `https://tu-app.vercel.app`) y, si usás dominio custom, esa también. Incluí **Preview** si probás despliegues por rama (cada preview tiene su propia URL; Dynamic suele exigir lista explícita o wildcards según el plan). Sin esto el widget puede fallar en prod y funcionar solo en `localhost`.
6. Tras cambiar dominios en Dynamic, probá login / conexión de wallet en la URL real (no solo en local).

---

## 6. Contratos en Arc Testnet (proceso operativo)

**Guía paso a paso solo para terminal y checklist:** [GUIA_DEPLOY_GAMEESCROW_ARC_PASO_A_PASO.md](./GUIA_DEPLOY_GAMEESCROW_ARC_PASO_A_PASO.md).

Orden recomendado para quien ejecute los scripts (Foundry) con una wallet **fondeada en Arc Testnet** (gas) y las variables cargadas en el entorno (ver también [`.env.example`](../.env.example), bloque Foundry).

**Decisión de cuentas:** `PRIVATE_KEY` (o `--private-key`) es quien **firma y paga el deploy**. `GAME_ESCROW_OWNER` es el `owner` on-chain del contrato; debe ser la misma dirección que derivás de `GAME_ESCROW_OWNER_PRIVATE_KEY` en Vercel, o una cuenta que controles para `settle` / `setClip`.

1. **USDC**  
   Usar la dirección oficial de USDC en Arc Testnet (ver docs de Arc / PRD).

2. **Compilar** (desde la raíz del repo):

   ```bash
   forge build
   ```

3. **Desplegar `GameEscrow`**  
   Script: `contracts/script/DeployGameEscrow.s.sol`.  
   Variables de entorno que espera el script:
   - `PRIVATE_KEY` — deployer (secreto; no commitear).
   - `GAME_USDC_ADDRESS`
   - `GAME_ESCROW_OWNER` (dirección que será `owner` del contrato — debe ser la misma que luego usarás como `GAME_ESCROW_OWNER_PRIVATE_KEY` en Vercel, o una cuenta controlada por vos).
   - `GAME_HOUSE_FEE_BPS` (ej. `100` = 1%; máximo 10000).

   Comando (el alias `arc-testnet` está definido en [`foundry.toml`](../foundry.toml)):

   ```bash
   forge script contracts/script/DeployGameEscrow.s.sol:DeployGameEscrowScript \
     --rpc-url arc-testnet \
     --broadcast \
     -vvvv
   ```

   La dirección del contrato aparece en la salida y en `broadcast/DeployGameEscrow.s.sol/5042002/` (raíz del repo; ignorado por git).

4. **Anotar** la dirección del contrato recién desplegada → `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` (local y Vercel) y redeploy de la app.

5. **Configurar bankroll y clips**  
   Script: `contracts/script/ConfigureGameEscrow.s.sol`.  
   Variables:
   - `PRIVATE_KEY` — debe ser la clave del **owner** del contrato (misma cuenta que `GAME_ESCROW_OWNER_PRIVATE_KEY` en Vercel).
   - `GAME_ESCROW_ADDRESS`
   - `GAME_USDC_ADDRESS`
   - `GAME_BANKROLL_AMOUNT` (unidades del token con 6 decimales; ejemplo: `50000000` = 50 USDC si 1 USDC = 1e6 unidades)
   - Por cada clip que quieras activar en una corrida del script:
     - `GAME_DEFAULT_CLIP_ID`
     - `GAME_DEFAULT_CLIP_ENABLED` (`true` / `false`)
     - `GAME_DEFAULT_CLIP_DIRECTION`: en contrato, **Left = 0**, **Right = 1**
     - `GAME_DEFAULT_CLIP_OUTCOME`: **Goal = 0**, **Miss = 1**

   El script configura **un clip por ejecución**. Tenés que ejecutarlo **una vez por cada `clipId`** que use la app, con el resultado que coincida con el `result.json` del video correspondiente. Quien firma debe ser el **owner** del escrow y, si `GAME_BANKROLL_AMOUNT > 0`, tener USDC y haber hecho `approve` al contrato en la misma transacción batch del script.

   ```bash
   forge script contracts/script/ConfigureGameEscrow.s.sol:ConfigureGameEscrowScript \
     --rpc-url arc-testnet \
     --broadcast \
     -vvvv
   ```

6. **Mapeo clip ↔ video (obligatorio que coincida)**  
   En código, los ids están en `ONCHAIN_CLIP_ID_BY_DEMO_SET` (`src/app/app/config.ts`):

   | ID on-chain | Set de demo (carpeta en `public/videos/demo/`) |
   |------------|-----------------------------------------------|
   | 1 | `messi-miss-1-left` |
   | 2 | `messi-goal-1-left` |
   | 3 | `messi-goal-2-right` |
   | 4 | `messi-goal-3-right` |
   | 5 | `messi-goal-4-right` |
   | 6 | `messi-miss-2-right` |

   Para cada uno, abrí el archivo `result.json` del mismo set:
   - `direction`: `"Left"` → `0`, `"Right"` → `1`
   - `score`: `"Goal"` → `0`, `"Miss"` → `1`

   Si el on-chain no coincide con el video, el usuario verá resultados coherentes en pantalla pero el contrato calculará otro payout.

7. **Solvencia**  
   Si el bankroll no cubre el peor caso de las apuestas, `play` fallará (`InsolventBankroll`). Subí `fundBankroll` o el monto en configure hasta que las pruebas con montos $1 / $10 / $25 pasen.

---

## 7. Wallets (testnet)

| Rol | Requisitos | Dónde se usa |
|-----|------------|--------------|
| **Operadora** | USDC testnet (para regalar al jugador ~3× el stake por partida según la API actual) + ETH testnet para gas de esas transferencias | `GAME_OPERATOR_PRIVATE_KEY` → `/api/game/fund` |
| **Owner del escrow** | Debe ser exactamente el `owner` del `GameEscrow` | `GAME_ESCROW_OWNER_PRIVATE_KEY` → `/api/game/settle` |

Recomendación: documentar en un lugar interno (Notion, etc.) las **direcciones públicas** de esas cuentas y el **enlace al explorador de bloques** del contrato, sin guardar las claves ahí.

---

## 8. Checklist final antes de dar por buena la “producción en testnet”

- [ ] Vercel con todas las variables de la tabla cargadas y **redeploy** hecho tras cada cambio de variables.
- [ ] `NEXT_PUBLIC_SITE_URL` = URL canónica de producción (metadata y enlaces coherentes).
- [ ] Dynamic: Environment ID correcto, red Arc usable, y **dominios / URLs de producción (y preview si aplica)** permitidos en el dashboard.
- [ ] Contrato desplegado, bankroll fundado, **los 6 clips** configurados alineados con `result.json`.
- [ ] Wallet operadora con suficiente USDC y ETH de testnet.
- [ ] Owner del contrato coincide con la clave secreta de settle.
- [ ] Probar en la URL pública: elegir apuesta → Play (debe disparar funding) → completar predicción y firmar → ver vídeo → al terminar, settle automático vía API → si aplica, claim.

**Si algo falla**, revisar en este orden: mensaje en pantalla (banner de error en `/app`) → logs de función en Vercel (JSON estructurado en rutas `/api/game/*`) → que `NEXT_PUBLIC_*` apunten al contrato correcto → balances USDC/gas de la operadora → bankroll del escrow → `setClip` vs JSON del video → dominios permitidos en Dynamic y red Arc.

---

## Enlaces útiles

- PRD técnico del proyecto: [Onchain_SmartContracts_Backend_PRD.md](./Onchain_SmartContracts_Backend_PRD.md)
- Variables de ejemplo en repo: [`.env.example`](../.env.example)
- Roadmap de siguientes pasos: [PROXIMOS_PASOS.md](./PROXIMOS_PASOS.md)
- Checklist E2E en producción testnet: [E2E_CHECKLIST_PRODUCTION_TESTNET.md](./E2E_CHECKLIST_PRODUCTION_TESTNET.md)
