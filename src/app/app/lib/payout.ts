import type { PredictionChoice } from "../config";
import type { DemoVideoResult } from "./demoResult";

const DIRECTION_PRICES = {
  left: 0.38,
  right: 0.62,
} as const;

const OUTCOME_PRICES = {
  goal: 0.78,
  miss: 0.22,
} as const;

const HOUSE_FEE_RATE = 0.05;

type PayoutLeg = {
  betAmount: number;
  sharePrice: number;
  shares: number;
  won: boolean;
  grossPayout: number;
  netPayout: number;
  houseFee: number;
};

export type PayoutBreakdown = {
  wager: number;
  userPick: PredictionChoice | null;
  actualResult: DemoVideoResult;
  direction: PayoutLeg;
  outcome: PayoutLeg;
  payoutTotal: number;
  profit: number;
  houseFee: number;
};

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function calculateLegPayout(
  betAmount: number,
  sharePrice: number,
  won: boolean
): PayoutLeg {
  const shares = betAmount / sharePrice;
  const grossPayout = won ? shares : 0;
  const houseFee = won ? grossPayout * HOUSE_FEE_RATE : 0;
  const netPayout = grossPayout - houseFee;

  return {
    betAmount: roundTo(betAmount, 2),
    sharePrice,
    shares: roundTo(shares, 3),
    won,
    grossPayout: roundTo(grossPayout, 2),
    netPayout: roundTo(netPayout, 2),
    houseFee: roundTo(houseFee, 2),
  };
}

function createLostLeg(betAmount: number, sharePrice: number): PayoutLeg {
  return {
    betAmount: roundTo(betAmount, 2),
    sharePrice,
    shares: roundTo(betAmount / sharePrice, 3),
    won: false,
    grossPayout: 0,
    netPayout: 0,
    houseFee: 0,
  };
}

export function calculatePayout({
  wager,
  userPick,
  actualResult,
}: {
  wager: number;
  userPick: PredictionChoice;
  actualResult: DemoVideoResult;
}): PayoutBreakdown {
  const directionBet = wager / 2;
  const outcomeBet = wager / 2;

  const directionLeg = calculateLegPayout(
    directionBet,
    DIRECTION_PRICES[userPick.direction],
    userPick.direction === actualResult.direction
  );

  const outcomeLeg = calculateLegPayout(
    outcomeBet,
    OUTCOME_PRICES[userPick.outcome],
    userPick.outcome === actualResult.outcome
  );

  const payoutTotal = roundTo(
    directionLeg.netPayout + outcomeLeg.netPayout,
    2
  );

  const houseFee = roundTo(
    directionLeg.houseFee + outcomeLeg.houseFee,
    2
  );

  return {
    wager: roundTo(wager, 2),
    userPick,
    actualResult,
    direction: directionLeg,
    outcome: outcomeLeg,
    payoutTotal,
    profit: roundTo(payoutTotal - wager, 2),
    houseFee,
  };
}

export function calculateTimeoutLossPayout({
  wager,
  actualResult,
}: {
  wager: number;
  actualResult: DemoVideoResult;
}): PayoutBreakdown {
  const directionBet = wager / 2;
  const outcomeBet = wager / 2;

  return {
    wager: roundTo(wager, 2),
    userPick: null,
    actualResult,
    direction: createLostLeg(
      directionBet,
      DIRECTION_PRICES[actualResult.direction]
    ),
    outcome: createLostLeg(outcomeBet, OUTCOME_PRICES[actualResult.outcome]),
    payoutTotal: 0,
    profit: roundTo(-wager, 2),
    houseFee: 0,
  };
}
