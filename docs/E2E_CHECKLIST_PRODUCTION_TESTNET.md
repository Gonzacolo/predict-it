# Checklist E2E — producción testnet (on-chain)

Usar en la **URL pública** (Vercel Production) con `NEXT_PUBLIC_GAME_ONCHAIN_ENABLED=true` y el resto de variables cargadas. Detalle operativo: [GUIA_CONFIGURACION_OPERATIVA.md](./GUIA_CONFIGURACION_OPERATIVA.md).

## Flujo mínimo

1. [ ] Abrir `/app`, conectar wallet (Dynamic), elegir **$1**, **$10** o **$25**.
2. [ ] **Play** → debe completarse el funding (USDC de prueba a la wallet) sin error en pantalla.
3. [ ] Tras el countdown, en la pausa del vídeo: elegir dirección y resultado → firmar **approve + play** en la wallet.
4. [ ] Ver el desenlace del clip → al terminar, **settle** vía API (sin error); resultado coherente con el contrato.
5. [ ] Si hay payout reclamable: **Claim** → firmar `claimTo` y ver éxito en el modal.
6. [ ] En pantalla de resultado: revisar enlaces **Ver en explorador** (fund, play, settle, claim si aplica) y **ticket ID** si se muestra.

Anotar para soporte interno:

- Tx hashes copiados desde la UI o desde la respuesta de red (`/api/game/fund`, `/api/game/settle`).
- Explorador: [ArcScan testnet](https://testnet.arcscan.app) (o `NEXT_PUBLIC_BLOCK_EXPLORER_URL` si la definiste).

## Preview vs Production (Vercel)

| Entorno | URL típica | `NEXT_PUBLIC_GAME_ESCROW_ADDRESS` | Notas |
|--------|------------|-----------------------------------|--------|
| Production | `https://<proyecto>.vercel.app` o custom | Escrow “oficial” demo | Lo que muestras en eventos |
| Preview | `https://<proyecto>-<hash>.vercel.app` | Opcional: otro deploy / mismos contratos | Variables por entorno en Vercel |

- [ ] Variables **Production** completas y redeploy.
- [ ] Si usás Preview con on-chain: mismas claves o un juego de contratos separado; documentar cuál es cuál.

## Registro interno (solo datos públicos)

| Concepto | Dirección o dato | Explorador / nota |
|----------|------------------|-------------------|
| GameEscrow | `0x…` | Enlace a contrato en ArcScan |
| USDC testnet | `0x…` | Misma red que el escrow |
| Owner (settle) | `0x…` | Debe coincidir con `GAME_ESCROW_OWNER_PRIVATE_KEY` |
| Operador (fund) | `0x…` | Wallet que envía USDC vía API |

No guardar claves privadas en este documento.

## Grabación opcional

Grabar una corrida completa (sin mostrar seed phrases ni claves) para reproducir regresiones antes de demos.
