// Polyfill Buffer + process for browser-bound Solana web3 code paths.
import { Buffer } from "buffer";

if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { Buffer?: typeof Buffer; global?: unknown; process?: { env: Record<string, string> } };
  if (!g.Buffer) g.Buffer = Buffer;
  if (!g.global) g.global = globalThis;
  if (!g.process) g.process = { env: {} };
}

export {};
