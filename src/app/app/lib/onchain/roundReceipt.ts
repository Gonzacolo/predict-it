/** On-chain txs collected during one game round (client UI). */
export type ChainRoundReceipt = {
  fundTxHash?: string;
  approveUsdcTxHash?: string;
  playTxHash?: string;
  settleTxHash?: string;
  claimTxHash?: string;
  ticketId?: string;
};
