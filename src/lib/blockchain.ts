// Blockchain integration metadata for Vica BlockLedger.
// Real transactions are submitted to Solana Devnet via the Memo Program.
// Only non-PII data goes on-chain: transaction id, order hash, activity code.

export const SOLANA_CLUSTER = "devnet" as const;
export const SOLANA_NETWORK_LABEL = "Solana Devnet";

// Solana SPL Memo Program v2
export const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr" as const;

export type BlockchainAction =
  | "PAYMENT_VERIFIED"
  | "PROBLEM_REPORTED"
  | "PACKING_STARTED"
  | "READY_FOR_PICKUP"
  | "ORDER_PICKED_UP";

export const ACTION_LABEL: Record<BlockchainAction, string> = {
  PAYMENT_VERIFIED: "Verifikasi Pembayaran",
  PROBLEM_REPORTED: "Transaksi Bermasalah",
  PACKING_STARTED: "Mulai Packing",
  READY_FOR_PICKUP: "Siap Diambil",
  ORDER_PICKED_UP: "Barang Sudah Diambil",
};

export function explorerTxUrl(signature: string) {
  return `https://explorer.solana.com/tx/${signature}?cluster=${SOLANA_CLUSTER}`;
}

export function buildMemoPayload(orderId: string, orderHash: string, action: BlockchainAction) {
  // Compact, non-PII memo: id | hash | action
  return `VICA|${orderId}|${orderHash}|${action}`;
}
