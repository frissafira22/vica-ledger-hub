import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    ssr: {
      noExternal: [
        "@solana/web3.js",
        "@solana/wallet-adapter-react",
        "@solana/wallet-adapter-react-ui",
        "@solana/wallet-adapter-base",
        "@solana/wallet-adapter-phantom",
        "@solana/wallet-adapter-solflare",
      ],
    },
  },
});
