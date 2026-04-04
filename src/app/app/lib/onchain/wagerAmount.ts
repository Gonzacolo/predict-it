/** USDC (6 decimals) amounts matching `GameEscrow` wager constants. */
export function wagerUsdcToAtomic(wagerUsdc: number): bigint {
  if (wagerUsdc === 1) return BigInt(1_000_000);
  if (wagerUsdc === 10) return BigInt(10_000_000);
  if (wagerUsdc === 25) return BigInt(25_000_000);
  throw new Error(`Unsupported wager: ${wagerUsdc}`);
}
