export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export const formatNumber = (n: number) => new Intl.NumberFormat("id-ID").format(n);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Simple deterministic hash (FNV-1a 64-bit-ish, hex). Simulation only.
export function simulateHash(input: string): string {
  let h1 = 0xcbf29ce4;
  let h2 = 0x84222325;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c ^ (i + 1), 0x01000193) >>> 0;
  }
  // mix more rounds for length
  let out = "";
  let s1 = h1, s2 = h2;
  for (let i = 0; i < 8; i++) {
    s1 = Math.imul(s1 ^ (s2 + i), 0x85ebca6b) >>> 0;
    s2 = Math.imul(s2 ^ (s1 + i), 0xc2b2ae35) >>> 0;
    out += s1.toString(16).padStart(8, "0") + s2.toString(16).padStart(8, "0");
  }
  return "0x" + out.slice(0, 64);
}

export const shortHash = (h: string) => (h.length > 16 ? `${h.slice(0, 10)}…${h.slice(-6)}` : h);
