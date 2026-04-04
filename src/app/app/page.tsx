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

type GameState =
  | "wager"
  | "countdown"
  | "video_playing"
  | "prediction"
  | "video_resuming"
  | "result";

type VideoMode = typeof CONFIG.ACTIVE_DEMO_SET_ID | "simulated";

export default function AppPage() {
  const activeDemoSet = CONFIG.ACTIVE_DEMO_VIDEO_SET;
  const realVideoMode: VideoMode = CONFIG.ACTIVE_DEMO_SET_ID;
  const [actualResult, setActualResult] = useState<DemoVideoResult>(
    DEFAULT_DEMO_VIDEO_RESULT
  );
  const [selectedWager, setSelectedWager] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>("wager");
  const [lastPrediction, setLastPrediction] = useState<PredictionChoice | null>(
    null
  );
  const lastPredictionRef = useRef<PredictionChoice | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [didWin, setDidWin] = useState(false);
  const [settlement, setSettlement] = useState<PayoutBreakdown | null>(null);
  // Default to the real demo set and keep simulation only as fallback.
  const [videoMode, setVideoMode] = useState<VideoMode>(realVideoMode);

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

  const handlePlay = () => {
    if (!playEnabled) return;
    setVideoError(false);
    setSettlement(null);
    lastPredictionRef.current = null;
    setLastPrediction(null);
    setVideoKey((k) => k + 1);
    setGameState("countdown");
  };

  const handleCountdownComplete = useCallback(() => {
    setGameState("video_playing");
  }, []);

  const handleReachedPausePoint = useCallback(() => {
    setGameState("prediction");
  }, []);

  const handlePredictionComplete = useCallback(
    (choice: { direction: Direction; outcome: Outcome } | null) => {
      lastPredictionRef.current = choice;
      setLastPrediction(choice);
      if (choice === null) {
        setSettlement(
          selectedWager !== null
            ? calculateTimeoutLossPayout({
                wager: selectedWager,
                actualResult,
              })
            : null
        );
        setDidWin(false);
        setGameState("result");
        return;
      }
      setGameState("video_resuming");
    },
    [actualResult, selectedWager]
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

  const handleVideoLoadError = useCallback(() => {
    setVideoError(true);
    setVideoMode("simulated");
  }, []);

  const handleRetryVideo = useCallback(() => {
    setVideoError(false);
    setVideoMode(realVideoMode);
    setVideoKey((k) => k + 1);
    setGameState("video_playing");
  }, [realVideoMode]);

  const handlePlayAgainFromResult = useCallback(() => {
    setGameState("wager");
    setSettlement(null);
    lastPredictionRef.current = null;
    setLastPrediction(null);
  }, []);

  const handleDevJump = useCallback(
    (step: GameState, options?: { resultWin?: boolean }) => {
      setVideoError(false);

      if (step === "wager") {
        lastPredictionRef.current = null;
        setLastPrediction(null);
        setDidWin(false);
        setGameState("wager");
        return;
      }

      if (step === "countdown") {
        lastPredictionRef.current = null;
        setLastPrediction(null);
        setVideoKey((k) => k + 1);
        setGameState("countdown");
        return;
      }

      if (step === "video_playing") {
        lastPredictionRef.current = null;
        setLastPrediction(null);
        setVideoKey((k) => k + 1);
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

        const computeSettlement = (choice: PredictionChoice | null) => {
          if (choice === null || selectedWager === null) return null;

          return calculatePayout({
            wager: selectedWager,
            userPick: choice,
            actualResult,
          });
        };

        if (options?.resultWin === true) {
          lastPredictionRef.current = actualChoice;
          setLastPrediction(actualChoice);
          const nextSettlement = computeSettlement(actualChoice);
          setSettlement(nextSettlement);
          setDidWin((nextSettlement?.profit ?? 0) > 0);
        } else if (options?.resultWin === false) {
          lastPredictionRef.current = losingChoice;
          setLastPrediction(losingChoice);
          const nextSettlement = computeSettlement(losingChoice);
          setSettlement(nextSettlement);
          setDidWin((nextSettlement?.profit ?? 0) > 0);
        } else {
          if (!lastPredictionRef.current) {
            lastPredictionRef.current = actualChoice;
            setLastPrediction(actualChoice);
          }
          const nextSettlement = computeSettlement(lastPredictionRef.current);
          setSettlement(nextSettlement);
          setDidWin((nextSettlement?.profit ?? 0) > 0);
        }
        setGameState("result");
      }
    },
    [actualResult, selectedWager]
  );

  const handleDevVideoMockChange = useCallback((value: boolean) => {
    setVideoError(false);
    if (
      gameState === "video_playing" ||
      gameState === "prediction" ||
      gameState === "video_resuming"
    ) {
      setVideoKey((k) => k + 1);
    }
    setVideoMode(value ? "simulated" : realVideoMode);
  }, [gameState, realVideoMode]);

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
          userPrediction={lastPrediction}
          wagerUsdc={selectedWager}
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
                  onComplete={handlePredictionComplete}
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
