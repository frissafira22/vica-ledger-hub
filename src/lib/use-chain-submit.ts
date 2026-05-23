import { useCallback } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useData } from "@/lib/data-store";
import { useAuth } from "@/lib/auth";
import {
  ACTION_LABEL,
  VICA_LEDGER_CONTRACT,
  simulateTxHash,
  type BlockchainAction,
} from "@/lib/blockchain";

interface SubmitArgs {
  orderId: string;
  orderHash: string;
  action: BlockchainAction;
}

/**
 * Submits a (SIMULATED) on-chain activity record.
 *
 * Wallet connect is real (wagmi/viem), but we never actually send a transaction
 * to mainnet/testnet from this prototype. Instead we deterministically derive
 * a tx-hash-shaped string and persist it to the audit log + blockchain log.
 *
 * Only non-PII data is recorded: order id, order hash, action code.
 */
export function useChainSubmit() {
  const { address, isConnected, chain } = useAccount();
  const { recordChainTx } = useData();
  const { user } = useAuth();

  return useCallback(
    async ({ orderId, orderHash, action }: SubmitArgs) => {
      if (!isConnected || !address) {
        toast.warning("Wallet belum terhubung", {
          description: "Silakan Connect Wallet untuk merekam aksi ini ke blockchain.",
        });
        return null;
      }
      const payload = `${VICA_LEDGER_CONTRACT}|${orderId}|${orderHash}|${action}|${address}|${Date.now()}`;
      // Simulated submission delay
      await new Promise((r) => setTimeout(r, 350));
      const txHash = simulateTxHash(payload);
      const log = recordChainTx({
        orderId,
        orderHash,
        action,
        actionLabel: ACTION_LABEL[action],
        txHash,
        walletAddress: address,
        network: chain?.name ?? "Sepolia",
        contract: VICA_LEDGER_CONTRACT,
        status: "Simulated",
        role: user?.role ?? "system",
        actor: user?.displayName ?? "system",
      });
      toast.success("Aksi tercatat di blockchain (simulasi)", {
        description: `${ACTION_LABEL[action]} · tx ${txHash.slice(0, 14)}…`,
      });
      return log;
    },
    [address, chain, isConnected, recordChainTx, user],
  );
}
