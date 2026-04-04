export function getTxExplorerBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://testnet.arcscan.app";
}

export function explorerTxUrl(txHash: string): string {
  return `${getTxExplorerBaseUrl()}/tx/${txHash}`;
}
