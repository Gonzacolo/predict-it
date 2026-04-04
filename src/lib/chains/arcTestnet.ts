import { defineChain } from "viem";

const defaultArcRpc = "https://rpc.testnet.arc.network";

export function getArcTestnet() {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? defaultArcRpc;

  return defineChain({
    id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 5042002,
    name: "Arc Testnet",
    nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
    rpcUrls: {
      default: { http: [rpcUrl] },
    },
    blockExplorers: {
      default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
    },
    testnet: true,
  });
}
