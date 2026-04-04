import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { getArcTestnet } from "@/lib/chains/arcTestnet";

function requirePrivateKey(envName: string): `0x${string}` {
  const raw = process.env[envName]?.trim();
  if (!raw?.startsWith("0x") || raw.length < 64) {
    throw new Error(`${envName} must be set to a 0x-prefixed private key.`);
  }
  return raw as `0x${string}`;
}

export function createOperatorWalletClient() {
  const chain = getArcTestnet();
  const account = privateKeyToAccount(
    requirePrivateKey("GAME_OPERATOR_PRIVATE_KEY")
  );
  const rpc = chain.rpcUrls.default.http[0];
  return createWalletClient({
    account,
    chain,
    transport: http(rpc),
  });
}

export function createEscrowOwnerWalletClient() {
  const chain = getArcTestnet();
  const account = privateKeyToAccount(
    requirePrivateKey("GAME_ESCROW_OWNER_PRIVATE_KEY")
  );
  const rpc = chain.rpcUrls.default.http[0];
  return createWalletClient({
    account,
    chain,
    transport: http(rpc),
  });
}
