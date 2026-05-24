import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Link2, ShieldCheck, Wallet, Hash, ExternalLink } from "lucide-react";
import { formatDateTime } from "@/lib/utils-format";
import { SolanaWalletButton, SolanaWalletBanner } from "@/components/solana-wallet-button";
import { MEMO_PROGRAM_ID, SOLANA_NETWORK_LABEL, explorerTxUrl } from "@/lib/blockchain";

export const Route = createFileRoute("/blockchain")({
  component: BlockchainPage,
});

function BlockchainPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { blockchain } = useData();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return [...blockchain]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .filter((b) => {
        if (!t) return true;
        return (
          b.id.toLowerCase().includes(t) ||
          b.orderId.toLowerCase().includes(t) ||
          b.txHash.toLowerCase().includes(t) ||
          b.actionLabel.toLowerCase().includes(t) ||
          (b.walletAddress ?? "").toLowerCase().includes(t)
        );
      });
  }, [blockchain, q]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Solana Devnet · Memo Program</div>
          <h1 className="font-display text-3xl font-bold">Blockchain Log</h1>
          <p className="text-sm text-muted-foreground">
            Catatan aktivitas penting yang direkam ke Solana Devnet. Hanya ID transaksi,
            hash order, dan kode aktivitas yang dikirim — tanpa data pribadi.
          </p>
        </div>
        <SolanaWalletButton />
      </div>

      <SolanaWalletBanner />

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Memo Program</div>
            <div className="mt-1 font-mono text-xs break-all">{MEMO_PROGRAM_ID}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Hash className="h-3.5 w-3.5" /> Network</div>
            <div className="mt-1 font-mono text-sm">{SOLANA_NETWORK_LABEL}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> Total Entri</div>
            <div className="mt-1 font-display text-2xl font-bold">{blockchain.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4" /> Riwayat Transaksi Blockchain ({filtered.length})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari ID / Order / Tx Hash / Wallet / Aktivitas…"
              className="pl-9 sm:w-80"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Order</th>
                  <th className="p-3">Aktivitas</th>
                  <th className="p-3">Signature</th>
                  <th className="p-3">Wallet</th>
                  <th className="p-3">Network</th>
                  <th className="p-3">Explorer</th>
                  <th className="p-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20">
                    <td className="p-3 font-mono text-xs">{b.id}</td>
                    <td className="p-3 font-mono text-xs">
                      <Link to="/orders/$id" params={{ id: b.orderId }} className="text-primary hover:underline">
                        {b.orderId}
                      </Link>
                    </td>
                    <td className="p-3">{b.actionLabel}</td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground max-w-[260px] truncate" title={b.txHash}>
                      {b.txHash}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">
                      {b.walletAddress ? `${b.walletAddress.slice(0, 6)}…${b.walletAddress.slice(-4)}` : "—"}
                    </td>
                    <td className="p-3 text-xs">{b.network}</td>
                    <td className="p-3">
                      <a
                        href={explorerTxUrl(b.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Lihat <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(b.timestamp)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-sm text-muted-foreground">
                      Belum ada aktivitas blockchain. Connect wallet Solana lalu lakukan
                      verifikasi pembayaran, packing, atau konfirmasi pengambilan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Format Memo</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
{`VICA|<orderId>|<orderHash>|<ACTIVITY_CODE>

Activity codes:
  PAYMENT_VERIFIED   — Admin memverifikasi pembayaran
  PROBLEM_REPORTED   — Admin menandai transaksi bermasalah
  PACKING_STARTED    — Gudang mulai packing
  READY_FOR_PICKUP   — Gudang menandai siap diambil
  ORDER_PICKED_UP    — Toko konfirmasi barang diambil

Tidak dikirim ke chain: nama, nomor HP, alamat, detail produk, nominal.`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
