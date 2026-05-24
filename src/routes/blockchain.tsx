import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Link2, ShieldCheck, Wallet, Hash } from "lucide-react";
import { formatDateTime } from "@/lib/utils-format";
import { SolanaWalletButton, SolanaWalletBanner } from "@/components/solana-wallet-button";
import { VICA_LEDGER_CONTRACT, VICA_LEDGER_ABI } from "@/lib/blockchain";

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
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Web3 Integration</div>
          <h1 className="font-display text-3xl font-bold">Blockchain Log</h1>
          <p className="text-sm text-muted-foreground">
            Catatan aktivitas penting yang direkam ke blockchain (simulasi). Hanya ID transaksi,
            hash, dan kode aktivitas yang dikirim — tanpa data pribadi.
          </p>
        </div>
        <SolanaWalletButton />
      </div>

      <SolanaWalletBanner />

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> Contract Address</div>
            <div className="mt-1 font-mono text-xs break-all">{VICA_LEDGER_CONTRACT}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Hash className="h-3.5 w-3.5" /> Method</div>
            <div className="mt-1 font-mono text-sm">recordActivity(string, bytes32, string)</div>
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
                  <th className="p-3">Tx Hash</th>
                  <th className="p-3">Wallet</th>
                  <th className="p-3">Network</th>
                  <th className="p-3">Status</th>
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
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium uppercase text-success">
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(b.timestamp)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-sm text-muted-foreground">
                      Belum ada aktivitas blockchain. Lakukan verifikasi pembayaran, packing,
                      atau konfirmasi pengambilan untuk mencatatnya ke chain (simulasi).
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
          <CardTitle className="text-base">Contract ABI</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
{JSON.stringify(VICA_LEDGER_ABI, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
