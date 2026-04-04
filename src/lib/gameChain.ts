import { type Address, isAddress } from "viem";

import { getArcTestnet } from "./chains/arcTestnet";

export function isGameOnchainEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GAME_ONCHAIN_ENABLED === "true";
}

export function getGameEscrowAddress(): Address | null {
  const raw = process.env.NEXT_PUBLIC_GAME_ESCROW_ADDRESS;
  if (!raw || !isAddress(raw)) return null;
  if (raw === "0x0000000000000000000000000000000000000000") return null;
  return raw;
}

export function getUsdcAddress(): Address | null {
  const raw = process.env.NEXT_PUBLIC_USDC_ADDRESS;
  if (!raw || !isAddress(raw)) return null;
  return raw;
}

export function getGameChain() {
  return getArcTestnet();
}

export function assertGameOnchainConfig(): {
  chain: ReturnType<typeof getArcTestnet>;
  escrow: Address;
  usdc: Address;
} {
  const chain = getGameChain();
  const escrow = getGameEscrowAddress();
  const usdc = getUsdcAddress();
  if (!escrow || !usdc) {
    throw new Error(
      "Missing NEXT_PUBLIC_GAME_ESCROW_ADDRESS or NEXT_PUBLIC_USDC_ADDRESS."
    );
  }
  return { chain, escrow, usdc };
}
