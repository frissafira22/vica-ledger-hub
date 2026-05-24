import { type ReactNode, useEffect, useState, lazy, Suspense } from "react";

const LazySolana = lazy(async () => {
  const [{ clusterApiUrl }, react, reactUi, phantom, solflare, base, blockchain] = await Promise.all([
    import("@solana/web3.js"),
    import("@solana/wallet-adapter-react"),
    import("@solana/wallet-adapter-react-ui"),
    import("@solana/wallet-adapter-phantom"),
    import("@solana/wallet-adapter-solflare"),
    import("@solana/wallet-adapter-base"),
    import("@/lib/blockchain"),
  ]);
  await import("@solana/wallet-adapter-react-ui/styles.css");

  const { ConnectionProvider, WalletProvider } = react;
  const { WalletModalProvider } = reactUi;
  const { PhantomWalletAdapter } = phantom;
  const { SolflareWalletAdapter } = solflare;
  const { WalletAdapterNetwork } = base;

  function Inner({ children }: { children: ReactNode }) {
    const endpoint = clusterApiUrl(blockchain.SOLANA_CLUSTER);
    const wallets = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
    ];
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }
  return { default: Inner };
});

export function SolanaProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{children}</>;
  return (
    <Suspense fallback={<>{children}</>}>
      <LazySolana>{children}</LazySolana>
    </Suspense>
  );
}
