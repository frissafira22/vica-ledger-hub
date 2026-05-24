import { type ReactNode, useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { SOLANA_CLUSTER } from "@/lib/blockchain";

import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl(SOLANA_CLUSTER), []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet })],
    [],
  );
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
