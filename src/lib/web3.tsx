import { type ReactNode, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
