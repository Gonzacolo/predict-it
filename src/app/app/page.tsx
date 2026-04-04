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
  type DemoVideoSetId,
  type Direction,
  type Outcome,
  type PredictionChoice,
} from "./config";
import {
  DEFAULT_DEMO_VIDEO_RESULT,
  loadDemoVideoResult,
  type DemoVideoResult,
} from "./lib/demoResult";
import {
  calculatePayout,
  calculateTimeoutLossPayout,
  type PayoutBreakdown,
} from "./lib/payout";

const wagerOptions = [1, 10, 25] as const;

const isProd = process.env.NODE_ENV === "production";
const devHudFlag = process.env.NEXT_PUBLIC_GAME_DEV_HUD;
const showGameDevHud = isProd
  ? devHudFlag === "true"
  : devHudFlag !== "false";

type ClaimPhase = "editing" | "error" | "submitting" | "success";
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

export default function AppPage() {
  const [actualResult, setActualResult] = useState<DemoVideoResult>(
    DEFAULT_DEMO_VIDEO_RESULT
  );
  const [claimErrorMessage, setClaimErrorMessage] = useState<string | null>(null);
  const [claimPhase, setClaimPhase] = useState<ClaimPhase>("editing");
  const [claimRecipient, setClaimRecipient] = useState("");
  const [didWin, setDidWin] = useState(false);
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

  const lastPredictionRef = useRef<PredictionChoice | null>(null);
  const activeDemoSet = useMemo(
    () => getDemoVideoSet(currentDemoSetId),
    [currentDemoSetId]
  );
  const realVideoMode: VideoMode = currentDemoSetId;

  const playEnabled = useMemo(() => selectedWager !== null, [selectedWager]);
  const usesSimulatedVideo = videoMode === "simulated";

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

  useEffect(() => {
    let cancelled = false;

    void loadDemoVideoResult(activeDemoSet.resultSrc).then((result) => {
      if (!cancelled) {
        setActualResult(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeDemoSet.resultSrc]);

  const videoPhase: DemoClipPhase = useMemo(() => {
    if (gameState === "video_playing") return "intro";
    if (gameState === "prediction") return "paused";
    if (gameState === "video_resuming") return "outro";
    return "intro";
  }, [gameState]);

  const resetRoundState = useCallback(() => {
    lastPredictionRef.current = null;
    setClaimErrorMessage(null);
    setClaimPhase("editing");
    setClaimRecipient("");
    setDidWin(false);
    setLastPrediction(null);
    setSettlement(null);
    setVideoError(false);
    setVideoMode(currentDemoSetId);
  }, [currentDemoSetId]);

  const handlePlay = useCallback(() => {
    if (selectedWager === null) return;
    resetRoundState();
    const nextDemoSetId = getRandomDemoSetId();
    setCurrentDemoSetId(nextDemoSetId);
    setVideoMode(nextDemoSetId);
    setVideoKey((value) => value + 1);
    setGameState("countdown");
  }, [resetRoundState, selectedWager]);

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
    setDidWin(false);
    setLastPrediction(null);
    setSettlement(nextSettlement);
    setGameState("result");
  }, [actualResult, selectedWager]);

  const handleLockPrediction = useCallback(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 1400));
  }, []);

  const handlePredictionConfirmed = useCallback(
    (choice: { direction: Direction; outcome: Outcome }) => {
      lastPredictionRef.current = choice;
      setLastPrediction(choice);
      setGameState("video_resuming");
    },
    []
  );

  const handleVideoEnded = useCallback(() => {
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
    setDidWin((nextSettlement?.profit ?? 0) > 0);
    setGameState("result");
  }, [actualResult, selectedWager]);

  const handleClaimSubmit = useCallback(async () => {
    if (!isEvmAddress(claimRecipient)) {
      setClaimPhase("error");
      setClaimErrorMessage("Enter a valid EVM wallet address.");
      return;
    }

    setClaimErrorMessage(null);
    setClaimPhase("submitting");
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setClaimPhase("success");
  }, [claimRecipient]);

  const handleClaimModalClose = useCallback(() => {
    if (claimPhase !== "success") {
      setClaimPhase("editing");
    }
    setClaimErrorMessage(null);
  }, [claimPhase]);

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

  const helperText = useMemo(() => {
    return "Demo mode: each round uses one of the bundled Messi clips and simulates the wallet confirmation locally.";
  }, []);

  const showVideoPhase =
    gameState === "video_playing" ||
    gameState === "prediction" ||
    gameState === "video_resuming";

  const devHudVideoError = showVideoPhase && videoError;

  if (gameState === "result") {
    return (
      <>
        <ResultScreen
          won={didWin}
          claimErrorMessage={claimErrorMessage}
          claimPhase={claimPhase}
          claimRecipient={claimRecipient}
          claimSuccessBody={
            claimPhase === "success"
              ? `Demo only: rewards would be sent to ${claimRecipient}.`
              : undefined
          }
          claimable={didWin}
          userPrediction={lastPrediction}
          wagerUsdc={selectedWager}
          onClaimModalClose={handleClaimModalClose}
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
          helperText={helperText}
          selectedWager={selectedWager}
          wagerOptions={wagerOptions}
          playEnabled={playEnabled}
          onPickWager={setSelectedWager}
          onPlay={handlePlay}
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
                  onEnded={handleVideoEnded}
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
                  onEnded={handleVideoEnded}
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
