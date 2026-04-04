const WINDOW_MS = 60_000;
const MAX_PER_IP = 24;
const MAX_PER_ADDRESS = 8;
/** Replay window for client Idempotency-Key (per attempt). */
const IDEMPOTENCY_HEADER_MS = 120_000;
/** Fallback dedupe when no header (double-submit); keep short so back-to-back rounds work. */
const IDEMPOTENCY_FALLBACK_MS = 25_000;

type Timestamps = number[];

const ipHits: Map<string, Timestamps> = new Map();
const addrHits: Map<string, Timestamps> = new Map();

type IdemEntry = {
  txHash: string;
  fundedAmount: string;
  createdAt: number;
  playerLower: string;
  wager: number;
};

const idemCache: Map<string, IdemEntry> = new Map();

function pruneTimestamps(ts: Timestamps, now: number): Timestamps {
  return ts.filter((t) => now - t < WINDOW_MS);
}

function idemTtlMs(key: string): number {
  return key.startsWith("h:") ? IDEMPOTENCY_HEADER_MS : IDEMPOTENCY_FALLBACK_MS;
}

function pruneIdem(now: number) {
  for (const [k, v] of idemCache) {
    if (now - v.createdAt > idemTtlMs(k)) idemCache.delete(k);
  }
}

export type FundRateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export function checkFundRateLimits(
  ip: string,
  playerLower: string
): FundRateLimitResult {
  const now = Date.now();
  pruneIdem(now);

  const ipList = pruneTimestamps(ipHits.get(ip) ?? [], now);
  if (ipList.length >= MAX_PER_IP) {
    const oldest = Math.min(...ipList);
    return {
      ok: false,
      retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }
  ipList.push(now);
  ipHits.set(ip, ipList);

  const aList = pruneTimestamps(addrHits.get(playerLower) ?? [], now);
  if (aList.length >= MAX_PER_ADDRESS) {
    const oldest = Math.min(...aList);
    return {
      ok: false,
      retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }
  aList.push(now);
  addrHits.set(playerLower, aList);

  return { ok: true };
}

/** Idempotency: prefer client Idempotency-Key header; else stable key per player + wager. */
export function fundIdempotencyKey(
  idemHeader: string | null,
  playerLower: string,
  wager: number
): string {
  const trimmed = idemHeader?.trim();
  if (trimmed && trimmed.length <= 128) return `h:${trimmed}`;
  return `p:${playerLower}:${wager}`;
}

export function getCachedFundResponse(key: string): IdemEntry | null {
  const now = Date.now();
  pruneIdem(now);
  const e = idemCache.get(key);
  if (!e) return null;
  if (now - e.createdAt > idemTtlMs(key)) {
    idemCache.delete(key);
    return null;
  }
  return e;
}

export function rememberFundSuccess(
  key: string,
  txHash: string,
  fundedAmount: string,
  playerLower: string,
  wager: number
) {
  const now = Date.now();
  idemCache.set(key, {
    txHash,
    fundedAmount,
    createdAt: now,
    playerLower,
    wager,
  });
}

export function matchesIdemEntry(
  entry: IdemEntry,
  playerLower: string,
  wager: number
): boolean {
  return entry.playerLower === playerLower && entry.wager === wager;
}
