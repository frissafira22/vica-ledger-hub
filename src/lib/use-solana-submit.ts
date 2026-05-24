import { useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { toast } from "sonner";
import { useData } from "@/lib/data-store";
import { useAuth } from "@/lib/auth";
import {
  ACTION_LABEL,
  MEMO_PROGRAM_ID,
  SOLANA_NETWORK_LABEL,
  buildMemoPayload,
  explorerTxUrl,
  type BlockchainAction,
} from "@/lib/blockchain";

interface SubmitArgs {
  orderId: string;
  orderHash: string;
  action: BlockchainAction;
}

/**
 * Submits a real Solana Devnet transaction via the Memo Program.
 * Memo content is non-PII: orderId | orderHash | actionCode.
 */
export function useSolanaSubmit() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { recordChainTx } = useData();
  const { user } = useAuth();

  return useCallback(
    async ({ orderId, orderHash, action }: SubmitArgs) => {
      if (!connected || !publicKey) {
        toast.warning("Hubungkan wallet Solana terlebih dahulu.");
        return null;
      }
      try {
        const memo = buildMemoPayload(orderId, orderHash, action);
        const ix = new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
          programId: new PublicKey(MEMO_PROGRAM_ID),
          data: Buffer.from(memo, "utf8"),
        });
        const tx = new Transaction().add(ix);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;

        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed",
        );

        const log = recordChainTx({
          orderId,
          orderHash,
          action,
          actionLabel: ACTION_LABEL[action],
          txHash: signature,
          walletAddress: publicKey.toBase58(),
          network: SOLANA_NETWORK_LABEL,
          contract: MEMO_PROGRAM_ID,
          status: "Confirmed",
          role: user?.role ?? "system",
          actor: user?.displayName ?? "system",
        });
        toast.success("Aktivitas berhasil dicatat ke Solana Devnet.", {
          description: `${ACTION_LABEL[action]} · ${signature.slice(0, 14)}…`,
          action: {
            label: "Explorer",
            onClick: () => window.open(explorerTxUrl(signature), "_blank", "noopener"),
          },
        });
        return log;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error("Gagal mengirim transaksi Solana", { description: msg });
        return null;
      }
    },
    [connected, publicKey, connection, sendTransaction, recordChainTx, user],
  );
}
