"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { appCopy } from "./copy";
import { Countdown } from "./components/Countdown";
import {
  DemoClipPlayer,
  type DemoClipPhase,
} from "./components/DemoClipPlayer";
import { GameDevHud } from "./components/GameDevHud";
import { GameFlowChrome } from "./components/GameFlowChrome";
import { PredictionPanel } from "./components/PredictionPanel";
import { ResultScreen } from "./components/ResultScreen";
import { SimulatedVideo } from "./components/SimulatedVideo";
import { WagerScreen } from "./components/WagerScreen";
import {
  CONFIG,
  getDemoVideoSet,
  getRandomDemoSetId,
  ONCHAIN_CLIP_ID_BY_DEMO_SET,
  type DemoVideoResult,
  type DemoVideoSetId,
  type Direction,
  type Outcome,
  type PredictionChoice,
} from "./config";
import type { GameChainAdapter } from "./gameChainAdapter";
import { explorerTxUrl } from "./lib/onchain/explorer";
import type { ChainRoundReceipt } from "./lib/onchain/roundReceipt";
import {
  calculatePayout,
  calculateTimeoutLossPayout,
  type PayoutBreakdown,
} from "./lib/payout";

const wagerOptions = [1, 5, 10] as const;

const isProd = process.env.NODE_ENV === "production";
const devHudFlag = process.env.NEXT_PUBLIC_GAME_DEV_HUD;
const showGameDevHud = isProd
  ? devHudFlag === "true"
  : devHudFlag !== "false";

type ClaimPhase = "editing" | "error" | "submitting" | "success";
type ClaimDestination = "connected" | "recipient";
type GameState =
  | "wager"
  | "countdown"
  | "video_playing"
  | "prediction"
  | "video_resuming"
  | "result";

type VideoMode = DemoVideoSetId | "simulated";

function isEvmAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

const DEMO_CONNECTED_WALLET = "0x5A74f2A3fBAb36E39A68D7d4f8d8D2f9d2B0C1e7";

export type GamePlayProps = {
  chain: GameChainAdapter | null;
};

export function GamePlay({ chain }: GamePlayProps) {
  const [actualResult, setActualResult] = useState<DemoVideoResult>(
    CONFIG.ACTIVE_DEMO_VIDEO_SET.result
  );
  const [claimErrorMessage, setClaimErrorMessage] = useState<string | null>(null);
  const [claimDestination, setClaimDestination] =
    useState<ClaimDestination>("connected");
  const [claimPhase, setClaimPhase] = useState<ClaimPhase>("editing");
  const [claimRecipient, setClaimRecipient] = useState("");
  const [didWin, setDidWin] = useState(false);
  const [claimable, setClaimable] = useState(false);
  const [gameState, setGameState] = useState<GameState>("wager");
  const [lastPrediction, setLastPrediction] = useState<PredictionChoice | null>(
    null
  );
  const [selectedWager, setSelectedWager] = useState<number | null>(null);
  const [settlement, setSettlement] = useState<PayoutBreakdown | null>(null);
  const [currentDemoSetId, setCurrentDemoSetId] = useState<DemoVideoSetId>(
    CONFIG.ACTIVE_DEMO_SET_ID
  );
  const [videoError, setVideoError] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [videoMode, setVideoMode] = useState<VideoMode>(CONFIG.ACTIVE_DEMO_SET_ID);
  const [playBusy, setPlayBusy] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [settleErrorMessage, setSettleErrorMessage] = useState<string | null>(
    null
  );
  const [chainReceipt, setChainReceipt] = useState<ChainRoundReceipt>({});

  const lastPredictionRef = useRef<PredictionChoice | null>(null);
  const ticketIdRef = useRef<bigint | null>(null);
  const fundIdempotencyRef = useRef<string | null>(null);

  const txExplorerHref = useCallback((hash: string) => explorerTxUrl(hash), []);
  const activeDemoSet = useMemo(
    () => getDemoVideoSet(currentDemoSetId),
    [currentDemoSetId]
  );
  const realVideoMode: VideoMode = currentDemoSetId;

  const playEnabled = useMemo(() => selectedWager !== null, [selectedWager]);
  const usesSimulatedVideo = videoMode === "simulated";

  const connectedDisplayAddress =
    chain?.getConnectedAddress() ?? DEMO_CONNECTED_WALLET;

  useEffect(() => {
    fundIdempotencyRef.current = null;
  }, [selectedWager]);

  useEffect(() => {
    const shouldWarn = gameState !== "wager" && gameState !== "result";
    if (!shouldWarn) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [gameState]);

  const videoPhase: DemoClipPhase = useMemo(() => {
    if (gameState === "video_playing") return "intro";
    if (gameState === "prediction") return "paused";
    if (gameState === "video_resuming") return "outro";
    return "intro";
  }, [gameState]);

  const resetRoundState = useCallback(() => {
    lastPredictionRef.current = null;
    ticketIdRef.current = null;
    setClaimErrorMessage(null);
    setClaimDestination("connected");
    setClaimPhase("editing");
    setClaimRecipient("");
    setDidWin(false);
    setClaimable(false);
    setLastPrediction(null);
    setSettlement(null);
    setVideoError(false);
    setVideoMode(currentDemoSetId);
    setChainReceipt({});
    setSettleErrorMessage(null);
  }, [currentDemoSetId]);

  const handlePlay = useCallback(async () => {
    if (selectedWager === null) return;

    if (chain) {
      setFlowError(null);
      if (!chain.getConnectedAddress()) {
        chain.openAuth();
        return;
      }
      setPlayBusy(true);
      try {
        if (!fundIdempotencyRef.current) {
          fundIdempotencyRef.current = crypto.randomUUID();
        }
        const { txHash } = await chain.fundForWager(selectedWager, {
          idempotencyKey: fundIdempotencyRef.current,
        });
        fundIdempotencyRef.current = null;
        resetRoundState();
        setChainReceipt({ fundTxHash: txHash });
        const nextDemoSetId = getRandomDemoSetId();
        setCurrentDemoSetId(nextDemoSetId);
        setActualResult(getDemoVideoSet(nextDemoSetId).result);
        setVideoMode(nextDemoSetId);
        setVideoKey((value) => value + 1);
        setGameState("countdown");
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Could not start the round.";
        setFlowError(message);
      } finally {
        setPlayBusy(false);
      }
      return;
    }

    resetRoundState();
    const nextDemoSetId = getRandomDemoSetId();
    setCurrentDemoSetId(nextDemoSetId);
    setActualResult(getDemoVideoSet(nextDemoSetId).result);
    setVideoMode(nextDemoSetId);
    setVideoKey((value) => value + 1);
    setGameState("countdown");
  }, [chain, resetRoundState, selectedWager]);

  const handleCountdownComplete = useCallback(() => {
    setGameState("video_playing");
  }, []);

  const handleReachedPausePoint = useCallback(() => {
    setGameState("prediction");
  }, []);

  const handlePredictionTimeout = useCallback(() => {
    const nextSettlement =
      selectedWager !== null
        ? calculateTimeoutLossPayout({
            wager: selectedWager,
            actualResult,
          })
        : null;

    lastPredictionRef.current = null;
    ticketIdRef.current = null;
    setDidWin(false);
    setClaimable(false);
    setLastPrediction(null);
    setSettlement(nextSettlement);
    setGameState("result");
  }, [actualResult, selectedWager]);

  const handleLockPrediction = useCallback(
    async (choice: { direction: Direction; outcome: Outcome }) => {
      if (chain) {
        const clipId = ONCHAIN_CLIP_ID_BY_DEMO_SET[currentDemoSetId];
        if (selectedWager === null) {
          throw new Error("Missing wager.");
        }
        const lock = await chain.lockStake({
          clipId,
          wagerUsdc: selectedWager,
          direction: choice.direction,
          outcome: choice.outcome,
        });
        ticketIdRef.current = lock.ticketId;
        setChainReceipt((prev) => ({
          ...prev,
          approveUsdcTxHash: lock.approveTxHash,
          playTxHash: lock.playTxHash,
          ticketId: lock.ticketId.toString(),
        }));
        await new Promise((resolve) => window.setTimeout(resolve, 400));
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 1400));
    },
    [chain, currentDemoSetId, selectedWager]
  );

  const handlePredictionConfirmed = useCallback(
    (choice: { direction: Direction; outcome: Outcome }) => {
      lastPredictionRef.current = choice;
      setLastPrediction(choice);
      setGameState("video_resuming");
    },
    []
  );

  const handleVideoEnded = useCallback(async () => {
    const choice = lastPredictionRef.current;
    const nextSettlement =
      choice !== null && selectedWager !== null
        ? calculatePayout({
            wager: selectedWager,
            userPick: choice,
            actualResult,
          })
        : null;

    setSettlement(nextSettlement);

    if (chain && ticketIdRef.current !== null) {
      setSettleErrorMessage(null);
      try {
        const { txHash } = await chain.settle(ticketIdRef.current);
        setChainReceipt((prev) => ({ ...prev, settleTxHash: txHash }));
        const { payout, canClaim } = await chain.readTicketAfterSettle(
          ticketIdRef.current
        );
        setDidWin(payout > BigInt(0));
        setClaimable(canClaim);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Settlement failed on-chain.";
        setSettleErrorMessage(message);
        setDidWin((nextSettlement?.profit ?? 0) > 0);
        setClaimable(false);
      }
    } else {
      setDidWin((nextSettlement?.profit ?? 0) > 0);
      setClaimable((nextSettlement?.profit ?? 0) > 0);
    }

    setGameState("result");
  }, [actualResult, chain, selectedWager]);

  const handleClaimSubmit = useCallback(async () => {
    const recipientValue =
      claimDestination === "connected"
        ? connectedDisplayAddress
        : claimRecipient.trim();

    if (!isEvmAddress(recipientValue)) {
      setClaimPhase("error");
      setClaimErrorMessage("Enter a valid EVM wallet address.");
      return;
    }

    setClaimErrorMessage(null);
    setClaimPhase("submitting");

    if (chain && ticketIdRef.current !== null && claimable) {
      try {
        await chain.claim(
          ticketIdRef.current,
          recipientValue as `0x${string}`
        );
        if (claimDestination === "recipient") {
          setClaimRecipient(recipientValue);
        }
        setClaimPhase("success");
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Claim transaction failed.";
        setClaimPhase("error");
        setClaimErrorMessage(message);
      }
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 900));
    if (claimDestination === "recipient") {
      setClaimRecipient(recipientValue);
    }
    setClaimPhase("success");
  }, [
    chain,
    claimDestination,
    claimRecipient,
    claimable,
    connectedDisplayAddress,
  ]);

  const handleClaimModalClose = useCallback(() => {
    if (claimPhase !== "success") {
      setClaimPhase("editing");
    }
    setClaimErrorMessage(null);
  }, [claimPhase]);

  const handleClaimDestinationChange = useCallback(
    (value: ClaimDestination) => {
      setClaimDestination(value);
      setClaimErrorMessage(null);
      if (claimPhase === "error") {
        setClaimPhase("editing");
      }
    },
    [claimPhase]
  );

  const handleVideoLoadError = useCallback(() => {
    setVideoError(true);
    setVideoMode("simulated");
  }, []);

  const handleRetryVideo = useCallback(() => {
    setVideoError(false);
    setVideoMode(realVideoMode);
    setVideoKey((value) => value + 1);
    setGameState("video_playing");
  }, [realVideoMode]);

  const handlePlayAgainFromResult = useCallback(() => {
    setFlowError(null);
    setGameState("wager");
    resetRoundState();
  }, [resetRoundState]);

  const handleDevJump = useCallback(
    (step: GameState, options?: { resultWin?: boolean }) => {
      setVideoError(false);

      if (step === "wager") {
        resetRoundState();
        setGameState("wager");
        return;
      }

      if (step === "countdown") {
        resetRoundState();
        setVideoKey((value) => value + 1);
        setGameState("countdown");
        return;
      }

      if (step === "video_playing") {
        resetRoundState();
        setVideoKey((value) => value + 1);
        setGameState("video_playing");
        return;
      }

      if (step === "prediction") {
        setGameState("prediction");
        return;
      }

      if (step === "video_resuming") {
        setGameState("video_resuming");
        return;
      }

      if (step === "result") {
        const actualChoice: PredictionChoice = {
          direction: actualResult.direction,
          outcome: actualResult.outcome,
        };
        const losingChoice: PredictionChoice = {
          direction: actualResult.direction === "left" ? "right" : "left",
          outcome: actualResult.outcome === "goal" ? "miss" : "goal",
        };
        const choice =
          options?.resultWin === true
            ? actualChoice
            : options?.resultWin === false
              ? losingChoice
              : actualChoice;

        lastPredictionRef.current = choice;
        setLastPrediction(choice);
        setSettlement(
          selectedWager !== null
            ? calculatePayout({
                wager: selectedWager,
                userPick: choice,
                actualResult,
              })
            : null
        );
        setDidWin(options?.resultWin !== false);
        setClaimable(options?.resultWin !== false);
        setGameState("result");
      }
    },
    [actualResult, resetRoundState, selectedWager]
  );

  const handleDevVideoMockChange = useCallback(
    (value: boolean) => {
      setVideoError(false);
      if (
        gameState === "video_playing" ||
        gameState === "prediction" ||
        gameState === "video_resuming"
      ) {
        setVideoKey((current) => current + 1);
      }
      setVideoMode(value ? "simulated" : realVideoMode);
    },
    [gameState, realVideoMode]
  );

  const showVideoPhase =
    gameState === "video_playing" ||
    gameState === "prediction" ||
    gameState === "video_resuming";

  const devHudVideoError = showVideoPhase && videoError;

  const claimSuccessBody =
    claimPhase === "success"
      ? chain
        ? claimDestination === "connected"
          ? `USDC sent on-chain to your connected wallet (${connectedDisplayAddress}).`
          : `USDC sent on-chain to ${claimRecipient}.`
        : claimDestination === "connected"
          ? `Demo only: rewards would be sent to your connected wallet (${connectedDisplayAddress}).`
          : `Demo only: rewards would be sent to ${claimRecipient}.`
      : undefined;

  if (gameState === "result") {
    return (
      <>
        <ResultScreen
          won={didWin}
          claimDestination={claimDestination}
          claimErrorMessage={claimErrorMessage}
          claimPhase={claimPhase}
          claimRecipient={claimRecipient}
          connectedWalletAddress={connectedDisplayAddress}
          claimSuccessBody={claimSuccessBody}
          claimable={claimable}
          userPrediction={lastPrediction}
          wagerUsdc={selectedWager}
          onClaimModalClose={handleClaimModalClose}
          onClaimDestinationChange={handleClaimDestinationChange}
          onClaimRecipientChange={setClaimRecipient}
          onClaimSubmit={() => {
            void handleClaimSubmit();
          }}
          onPlayAgain={handlePlayAgainFromResult}
          replaySrc={activeDemoSet.fullSrc}
          actualDirection={actualResult.direction}
          actualOutcome={actualResult.outcome}
          settlement={settlement}
          simulateVideo={usesSimulatedVideo}
          chainActivity={chain ? chainReceipt : null}
          settleErrorMessage={chain ? settleErrorMessage : null}
          txExplorerHref={chain ? txExplorerHref : undefined}
        />
        {showGameDevHud && (
          <GameDevHud
            gameState="result"
            videoError={videoError}
            devVideoMock={usesSimulatedVideo}
            onDevVideoMockChange={handleDevVideoMockChange}
            onJump={handleDevJump}
            surface="dark"
          />
        )}
      </>
    );
  }

  return (
    <>
      {gameState === "wager" && (
        <WagerScreen
          helperText={chain ? appCopy.wager.onChainHint : null}
          predictionSeconds={CONFIG.PREDICTION_TOTAL_SECONDS}
          showMarketOdds={!!chain}
          isBusy={playBusy}
          busyLabel={
            chain ? appCopy.wager.funding : appCopy.wager.preparing
          }
          playLabel={
            chain ? appCopy.wager.playOnChain : appCopy.wager.playDemo
          }
          flowError={chain ? flowError : null}
          onDismissFlowError={
            chain ? () => setFlowError(null) : undefined
          }
          selectedWager={selectedWager}
          wagerOptions={wagerOptions}
          playEnabled={playEnabled}
          onPickWager={setSelectedWager}
          onPlay={() => {
            void handlePlay();
          }}
        />
      )}

      {showVideoPhase && (
        <div className="game-dark fixed inset-0 z-[60] flex min-h-0 flex-col overflow-x-clip">
          <GameFlowChrome
            variant="dark"
            selectedWager={selectedWager}
            className="shrink-0 border-b border-[var(--game-border)] bg-[var(--game-nav-bg)] backdrop-blur-md"
          />
          {videoError && !usesSimulatedVideo ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
              <p className="font-[family-name:var(--font-bebas)] text-3xl uppercase text-[var(--game-foreground)]">
                {appCopy.video.unavailable}
              </p>
              <p className="max-w-sm text-sm text-[var(--game-foreground-muted)]">
                {appCopy.video.unavailableHint}
              </p>
              <button
                type="button"
                onClick={handleRetryVideo}
                className="game-cta-primary embed-touch-target inline-flex items-center justify-center rounded-full px-10 text-sm font-semibold uppercase tracking-widest"
              >
                {appCopy.video.retry}
              </button>
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 flex-col">
              {usesSimulatedVideo ? (
                <SimulatedVideo
                  key={videoKey}
                  pauseAtSeconds={CONFIG.SIMULATED_INTRO_SECONDS}
                  phase={videoPhase}
                  slideUp={gameState === "prediction"}
                  onReachedPausePoint={handleReachedPausePoint}
                  onEnded={() => {
                    void handleVideoEnded();
                  }}
                />
              ) : (
                <DemoClipPlayer
                  key={videoKey}
                  introSrc={activeDemoSet.beforeSrc}
                  outroSrc={activeDemoSet.afterSrc}
                  poster={activeDemoSet.poster || undefined}
                  phase={videoPhase}
                  slideUp={gameState === "prediction"}
                  onReachedPausePoint={handleReachedPausePoint}
                  onEnded={() => {
                    void handleVideoEnded();
                  }}
                  onLoadError={handleVideoLoadError}
                />
              )}
              {gameState === "prediction" && (
                <PredictionPanel
                  totalSeconds={CONFIG.PREDICTION_TOTAL_SECONDS}
                  wagerUsdc={selectedWager}
                  onConfirmed={handlePredictionConfirmed}
                  onLockPrediction={handleLockPrediction}
                  onTimeout={handlePredictionTimeout}
                  walletWaitingText={
                    chain ? appCopy.walletModal.waitingOnChain : undefined
                  }
                />
              )}
            </div>
          )}
        </div>
      )}

      {gameState === "countdown" && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {showGameDevHud && (
        <GameDevHud
          gameState={gameState}
          videoError={devHudVideoError}
          devVideoMock={usesSimulatedVideo}
          onDevVideoMockChange={handleDevVideoMockChange}
          onJump={handleDevJump}
          surface={gameState === "wager" ? "light" : "dark"}
        />
      )}
    </>
  );
}
