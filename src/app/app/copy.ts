/** Centralized copy: landing and /app in English. */

export const appCopy = {
  nav: {
    home: "Home",
    howItWorks: "How It Works",
    leaderboard: "Leaderboard",
    connectWallet: "Demo mode",
    wager: (usdc: number) => `Wager: ${usdc} USDC`,
    wagerPending: "Choose your wager",
  },
  wager: {
    funding: "Sending testnet USDC…",
    preparing: "Preparing…",
    playDemo: "Play demo round",
    playOnChain: "Play with testnet USDC",
    onChainHint:
      "Arc Testnet only: USDC here is test tokens with no real value. Stakes and claims are on-chain via the escrow contract.",
    rulesTitle: "How this round works",
    ruleStep1: "Watch the clip until it pauses right before the shot.",
    ruleStep2: "Pick direction first (left or right), then outcome (goal or miss).",
    ruleStep3: (seconds: number) =>
      `Your pick locks automatically when the ${seconds}-second timer ends.`,
    marketOddsNote:
      "Payout uses two independent legs (direction + outcome) that settle from the pool. Model odds shown are illustrative; final settlement follows the smart contract.",
    demoModeNote:
      "Demo mode uses bundled clips and a simulated wallet. No on-chain transactions are sent.",
    disclaimer:
      "Important: if both picks are not completed before the timer ends, your round can settle as a loss.",
  },
  video: {
    tapToStart: "Tap to start",
    loading: "Loading video...",
    unavailable: "Video unavailable",
    unavailableHint:
      "Add before.mp4 and after.mp4 under public/videos/demo/<set-id>, or switch to the simulated fallback in the gear menu.",
    retry: "Retry",
  },
  prediction: {
    step1: "Step 1 · Side",
    step1Q: "Which side will the shot go?",
    step2: "Step 2 · Outcome",
    step2Q: "Goal or miss?",
    step3: "Step 3 · Locking",
    yourPick: "Your prediction",
    confirmHint:
      "Your prediction will lock automatically when the countdown ends.",
    confirmCta: "Auto-confirming when the timer ends",
    timerReady: "Ready to sign",
    left: "Left",
    right: "Right",
    goal: "Goal",
    miss: "Miss",
  },
  walletModal: {
    title: "Lock prediction",
    waiting: "Simulating wallet confirmation…",
    waitingOnChain: "Approve USDC and confirm play in your wallet…",
    success: "Prediction recorded on-chain",
    continue: "Continue",
  },
  claimModal: {
    title: "Claim rewards",
    body: "Choose where your rewards should be sent in the live product.",
    destinationLabel: "Claim destination",
    connectedWalletTitle: "Connected wallet",
    connectedWalletHint: "Fastest option. Rewards go to your current EVM wallet.",
    recipientWalletTitle: "Recipient wallet",
    recipientWalletHint: "Send rewards to a different EVM address.",
    recipientInputLabel: "Recipient wallet address",
    recipientInputPlaceholder: "0x...",
    submit: "Claim rewards",
    playAgain: "Play again",
    waitingTx: "Waiting for confirmation…",
  },
  flowError: {
    dismiss: "Dismiss",
    playTitle: "Could not start the round",
    settleTitle: "Settlement did not complete on-chain",
    settleBody:
      "The video result below is for display only. Rewards and claim may not match the contract until settlement succeeds.",
  },
  chainActivity: {
    title: "On-chain activity",
    subtitle:
      "These links open real Arc Testnet transactions in the block explorer. Your ticket ID is the on-chain record for this round.",
    fund: "Faucet (USDC transfer)",
    approve: "Approve USDC",
    play: "Lock stake (play)",
    settle: "Settle ticket",
    claim: "Claim payout",
    ticketId: "Ticket ID",
    viewTx: "View transaction",
  },
  result: {
    winLabel: "Payout",
    winTitle: "Profitable round",
    loseLabel: "Settlement",
    loseTitle: "Round settled",
    playedWith: (n: number) => `You played with ${n} USDC`,
    yourPrediction: "Your prediction",
    whatHappened: "What happened",
    incomplete: "Incomplete / time expired",
    claimRewards: "Claim rewards",
    playAgain: "Play again",
    tryAgain: "Try again",
    shareX: "Share on X",
    simulatedReplay: "Loop replay (placeholder)",
    simulatedReplayHint:
      "Add full.mp4 under public/videos/demo/<set-id> to show the complete replay.",
    payoutSummary: "Payout summary",
    directionPayout: "Direction payout",
    outcomePayout: "Outcome payout",
    totalPayout: "Total payout",
    profitLoss: "Profit / Loss",
    houseFee: "House fee",
  },
} as const;
