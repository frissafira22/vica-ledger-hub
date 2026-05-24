import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ScanLine, CheckCircle2, AlertTriangle, Clock, XCircle, PackageCheck } from "lucide-react";
import { PaymentBadge, PackingBadge, PickupBadge } from "@/components/status-badges";
import { formatIDR, formatDateTime, shortHash } from "@/lib/utils-format";
import { toast } from "sonner";
import { useSolanaSubmit } from "@/lib/use-solana-submit";
import { WalletStatusBanner } from "@/components/wallet-connect";

export const Route = createFileRoute("/store")({
  component: StorePage,
});

function StorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, confirmPickup } = useData();
  const submitChain = useSolanaSubmit();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin" && user.role !== "toko") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const result = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return null;
    return orders.find(
      (o) =>
        o.id.toLowerCase() === term ||
        o.invoice.toLowerCase() === term ||
        o.pickupCode.toLowerCase() === term ||
        o.hash.toLowerCase() === term ||
        o.customerName.toLowerCase().includes(term),
    );
  }, [q, orders]);

  if (!user || (user.role !== "admin" && user.role !== "toko")) return null;

  const validation = (() => {
    if (!result) return null;
    if (result.paymentStatus === "Bermasalah") return { tone: "destructive", icon: AlertTriangle, title: "Transaksi Bermasalah", message: "Tidak boleh diberikan. Hubungi Admin." };
    if (result.paymentStatus === "Gagal") return { tone: "destructive", icon: XCircle, title: "Transaksi Gagal", message: "Tidak boleh diberikan." };
    if (result.paymentStatus === "Menunggu Verifikasi") return { tone: "warning", icon: Clock, title: "Belum Bayar / Belum Diverifikasi", message: "Tidak boleh diberikan. Tunggu verifikasi Admin." };
    if (result.pickupStatus === "Sudah Diambil") return { tone: "warning", icon: AlertTriangle, title: "Sudah Diambil Sebelumnya", message: "Barang telah diambil. Tidak boleh diambil ulang." };
    if (result.packingStatus !== "Siap Diambil") return { tone: "info", icon: Clock, title: "Belum Siap", message: "Mohon tunggu — Gudang masih memproses pesanan." };
    return { tone: "success", icon: CheckCircle2, title: "Valid — Boleh Diberikan", message: "Pelanggan dapat menerima barang. Tekan tombol konfirmasi." };
  })();

  const canConfirm =
    result &&
    result.paymentStatus === "Terverifikasi" &&
    result.packingStatus === "Siap Diambil" &&
    result.pickupStatus === "Belum Diambil";

  const toneClasses: Record<string, string> = {
    success: "border-success/40 bg-success/10",
    warning: "border-warning/40 bg-warning/10",
    info: "border-info/40 bg-info/10",
    destructive: "border-destructive/40 bg-destructive/10",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Verifikasi Toko</h1>
        <p className="text-sm text-muted-foreground">
          Cari transaksi dengan ID, Invoice, Kode Pengambilan, Hash, atau Nama pelanggan.
        </p>
      </div>

      <WalletStatusBanner />

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ScanLine className="h-4 w-4" /> Cari Transaksi</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="TRX-2026-001 / INV-2026-001 / PICK-2026-001 / 0x… / Nama"
              className="h-12 pl-10 font-mono"
            />
          </div>
          {q && !result && (
            <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Tidak ditemukan transaksi yang cocok.
            </div>
          )}
        </CardContent>
      </Card>

      {result && validation && (
        <Card className={`border-2 ${toneClasses[validation.tone]}`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <validation.icon className="h-6 w-6 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-display text-lg font-bold">{validation.title}</div>
                <div className="text-sm">{validation.message}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground">{result.id} · {result.invoice}</div>
                <CardTitle>{result.customerName}</CardTitle>
                <div className="text-sm text-muted-foreground">{result.customerPhone}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <PaymentBadge status={result.paymentStatus} />
                <PackingBadge status={result.packingStatus} />
                <PickupBadge status={result.pickupStatus} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Info label="Kode Pengambilan" value={result.pickupCode} mono />
              <Info label="Total Pembayaran" value={formatIDR(result.totalAmount)} />
              <Info label="Total Dus" value={`${result.totalBoxes} dus · ${result.totalPcs} pcs`} />
              <Info label="Dibuat" value={formatDateTime(result.createdAt)} />
              <div className="sm:col-span-2">
                <div className="text-xs text-muted-foreground">Hash</div>
                <div className="font-mono text-xs break-all">{shortHash(result.hash)}</div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Item</div>
              <div className="space-y-1 text-sm">
                {result.items.map((it) => (
                  <div key={it.productCode} className="flex justify-between">
                    <span>{it.productName}</span>
                    <span className="font-mono text-xs text-muted-foreground">{it.boxes} dus</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              disabled={!canConfirm}
              className="w-full bg-gradient-primary shadow-elegant"
              onClick={async () => {
                confirmPickup(result.id, user.displayName, "toko");
                toast.success("Barang dikonfirmasi sudah diambil");
                await submitChain({ orderId: result.id, orderHash: result.hash, action: "ORDER_PICKED_UP" });
              }}
            >
              <PackageCheck className="mr-2 h-5 w-5" />
              Konfirmasi Barang Sudah Diambil
            </Button>
            {!canConfirm && (
              <p className="text-center text-xs text-muted-foreground">
                Tombol nonaktif: kondisi belum terpenuhi (terverifikasi · siap diambil · belum diambil).
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
