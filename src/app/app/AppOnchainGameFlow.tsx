"use client";

import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useMemo } from "react";

import { assertGameOnchainConfig } from "@/lib/gameChain";
import { gameEscrowAbi } from "@/lib/contracts/gameEscrowAbi";

import type { GameChainAdapter } from "./gameChainAdapter";
import { GamePlay } from "./GamePlay";
import { directionToUint8, outcomeToUint8 } from "./lib/onchain/encodePick";
import {
  approveAndPlay,
  claimToTicket,
  createGamePublicClient,
} from "./lib/onchain/transactions";
import { wagerUsdcToAtomic } from "./lib/onchain/wagerAmount";

export function AppOnchainGameFlow() {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();

  const { publicClient, chain, escrow, usdc } = useMemo(() => {
    const cfg = assertGameOnchainConfig();
    const rpc = cfg.chain.rpcUrls.default.http[0];
    return {
      publicClient: createGamePublicClient(cfg.chain, rpc),
      chain: cfg.chain,
      escrow: cfg.escrow,
      usdc: cfg.usdc,
    };
  }, []);

  const adapter: GameChainAdapter = useMemo(
    () => ({
      getConnectedAddress: () => primaryWallet?.address,
      openAuth: () => {
        setShowAuthFlow(true);
      },
      fundForWager: async (wagerUsdc, opts) => {
        const addr = primaryWallet?.address;
        if (!addr) {
          throw new Error("Connect a wallet first.");
        }
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (opts?.idempotencyKey) {
          headers["Idempotency-Key"] = opts.idempotencyKey;
        }
        const res = await fetch("/api/game/fund", {
          method: "POST",
          headers,
          body: JSON.stringify({
            playerWalletAddress: addr,
            desiredWagerUsdc: wagerUsdc,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          txHash?: string;
        };
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Funding failed."
          );
        }
        if (typeof data.txHash !== "string" || !data.txHash.startsWith("0x")) {
          throw new Error("Funding response missing transaction hash.");
        }
        return { txHash: data.txHash as `0x${string}` };
      },
      lockStake: async ({
        clipId,
        wagerUsdc,
        direction,
        outcome,
      }) => {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
          throw new Error("Ethereum wallet required.");
        }
        await primaryWallet.switchNetwork(chain.id);
        const walletClient = await primaryWallet.getWalletClient();
        if (!walletClient) {
          throw new Error("Wallet client unavailable.");
        }
        return approveAndPlay({
          walletClient,
          publicClient,
          usdc,
          escrow,
          clipId,
          amount: wagerUsdcToAtomic(wagerUsdc),
          direction: directionToUint8(direction),
          outcome: outcomeToUint8(outcome),
        });
      },
      settle: async (ticketId: bigint) => {
        const res = await fetch("/api/game/settle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: ticketId.toString() }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          txHash?: string;
        };
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Settle failed."
          );
        }
        if (typeof data.txHash !== "string" || !data.txHash.startsWith("0x")) {
          throw new Error("Settle response missing transaction hash.");
        }
        return { txHash: data.txHash as `0x${string}` };
      },
      claim: async (ticketId, recipient) => {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
          throw new Error("Ethereum wallet required.");
        }
        await primaryWallet.switchNetwork(chain.id);
        const walletClient = await primaryWallet.getWalletClient();
        if (!walletClient) {
          throw new Error("Wallet client unavailable.");
        }
        const txHash = await claimToTicket({
          walletClient,
          publicClient,
          escrow,
          ticketId,
          recipient,
        });
        return { txHash };
      },
      readTicketAfterSettle: async (ticketId: bigint) => {
        const ticket = (await publicClient.readContract({
          address: escrow,
          abi: gameEscrowAbi,
          functionName: "getTicket",
          args: [ticketId],
        })) as { payout: bigint };
        const canClaim = (await publicClient.readContract({
          address: escrow,
          abi: gameEscrowAbi,
          functionName: "canClaim",
          args: [ticketId],
        })) as boolean;
        return { payout: ticket.payout, canClaim };
      },
    }),
    [
      chain.id,
      escrow,
      primaryWallet,
      publicClient,
      setShowAuthFlow,
      usdc,
    ]
  );

  return <GamePlay chain={adapter} />;
}
