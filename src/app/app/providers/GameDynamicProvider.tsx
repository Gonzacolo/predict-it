"use client";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import type { GenericNetwork } from "@dynamic-labs/types";
import { useMemo, type ReactNode } from "react";

import { isGameOnchainEnabled } from "@/lib/gameChain";

function arcNetworkFromEnv(): GenericNetwork {
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.testnet.arc.network";
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 5042002;

  return {
    blockExplorerUrls: ["https://testnet.arcscan.app"],
    chainId,
    networkId: chainId,
    name: "Arc Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: [rpcUrl],
    iconUrls: [],
    vanityName: "arc-testnet",
  };
}

export function GameDynamicProvider({ children }: { children: ReactNode }) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID?.trim();

  const evmNetworks = useMemo(() => {
    const arc = arcNetworkFromEnv();
    return (dashboard: GenericNetwork[]) => [...dashboard, arc];
  }, []);

  if (!isGameOnchainEnabled()) {
    return <>{children}</>;
  }

  if (!environmentId) {
    return <>{children}</>;
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks,
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
