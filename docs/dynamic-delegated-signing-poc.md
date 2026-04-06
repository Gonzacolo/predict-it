# Dynamic delegated/session signing POC

## Objective
Evaluate whether Dynamic can reduce user signing friction for gameplay transactions without moving the app to a custodial model.

## Current state
- Gameplay requires user wallet signatures for `approve` and `play` (with allowance optimization already reducing repeated approvals).
- Claims require user signature for `claimTo`.
- Server currently funds users and settles tickets with server-managed keys.

## What Dynamic can help with
- **Delegated signing** can reduce repetitive wallet prompts if users explicitly grant delegation.
- **Session keys** can improve UX for short-lived trusted sessions.
- **Gas sponsorship / AA helpers** can reduce fee friction, but do not eliminate user-consent requirements by themselves.

## Constraints and risks
- Delegated signing still requires initial user consent and secure handling of delegation credentials.
- Mis-scoped delegation increases blast radius if backend is compromised.
- Legal/compliance and trust posture must stay non-custodial in product messaging.
- Fallback path must remain available when delegated/session signing is unavailable.

## Recommended MVP approach
1. Keep default non-custodial flow as baseline.
2. Add **feature flag** for delegated-signing experiments:
   - `NEXT_PUBLIC_DYNAMIC_DELEGATED_SIGNING_ENABLED=false`
3. Add backend-only guarded path (opt-in):
   - enable only for internal testers / staging.
4. Enforce strict policy:
   - short-lived delegation/session windows
   - scope to specific contract methods and limits
   - audit logs for each delegated action

## Proposed experiment design
- **A/B baseline vs delegated path** on testnet only.
- Success metrics:
  - signatures per completed round
  - drop-off between prediction lock and play confirmation
  - claim completion rate
- Safety metrics:
  - delegated failures
  - invalid scope attempts blocked
  - incident-free runtime window

## Suggested implementation tasks (behind flag)
- Frontend:
  - expose delegated-session status in UI.
  - fallback to normal wallet signature path on any delegated error.
- Backend:
  - validate delegated capability before route execution.
  - reject out-of-scope method calls and amounts.
  - log delegated signer identity + request context.

## Decision gate
Proceed to production only if:
- measurable reduction in signature friction,
- no increase in failed/unsafe flows,
- clear operational runbook for key/session rotation and incident response.
