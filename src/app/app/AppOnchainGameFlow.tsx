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
      fundForWager: async (wagerUsdc: number) => {
        const addr = primaryWallet?.address;
        if (!addr) {
          throw new Error("Connect a wallet first.");
        }
        const res = await fetch("/api/game/fund", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerWalletAddress: addr,
            desiredWagerUsdc: wagerUsdc,
          }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            typeof err.error === "string" ? err.error : "Funding failed."
          );
        }
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
        const { ticketId } = await approveAndPlay({
          walletClient,
          publicClient,
          usdc,
          escrow,
          clipId,
          amount: wagerUsdcToAtomic(wagerUsdc),
          direction: directionToUint8(direction),
          outcome: outcomeToUint8(outcome),
        });
        return ticketId;
      },
      settle: async (ticketId: bigint) => {
        const res = await fetch("/api/game/settle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: ticketId.toString() }),
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            typeof err.error === "string" ? err.error : "Settle failed."
          );
        }
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
        await claimToTicket({
          walletClient,
          publicClient,
          escrow,
          ticketId,
          recipient,
        });
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
