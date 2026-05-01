import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentBadge, PackingBadge, PickupBadge } from "@/components/status-badges";
import { formatIDR, formatNumber, shortHash, formatDateTime } from "@/lib/utils-format";
import { Search, Eye, CheckCircle2, Filter, X, Wallet, Boxes as BoxesIcon, Clock, Truck } from "lucide-react";
import { toast } from "sonner";
import type { PaymentStatus, PackingStatus, PickupStatus } from "@/lib/types";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, setPaymentStatus } = useData();
  const [q, setQ] = useState("");
  const [payment, setPayment] = useState<PaymentStatus | "all">("all");
  const [packing, setPacking] = useState<PackingStatus | "all">("all");
  const [pickup, setPickup] = useState<PickupStatus | "all">("all");

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders
      .filter((o) => payment === "all" || o.paymentStatus === payment)
      .filter((o) => packing === "all" || o.packingStatus === packing)
      .filter((o) => pickup === "all" || o.pickupStatus === pickup)
      .filter((o) => {
        if (!term) return true;
        return (
          o.id.toLowerCase().includes(term) ||
          o.invoice.toLowerCase().includes(term) ||
          o.pickupCode.toLowerCase().includes(term) ||
          o.customerName.toLowerCase().includes(term) ||
          o.hash.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, q, payment, packing, pickup]);

  const stats = useMemo(() => {
    const totalValue = filtered
      .filter((o) => o.paymentStatus !== "Gagal")
      .reduce((s, o) => s + o.totalAmount, 0);
    const totalBoxes = filtered.reduce((s, o) => s + o.totalBoxes, 0);
    const pending = filtered.filter((o) => o.paymentStatus === "Menunggu Verifikasi").length;
    const delivered = filtered.filter((o) => o.pickupStatus === "Sudah Diambil").length;
    return { count: filtered.length, totalValue, totalBoxes, pending, delivered };
  }, [filtered]);

  const hasFilter = q || payment !== "all" || packing !== "all" || pickup !== "all";
  const reset = () => {
    setQ("");
    setPayment("all");
    setPacking("all");
    setPickup("all");
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Pembukuan</div>
        <h1 className="font-display text-3xl font-bold">Riwayat Transaksi</h1>
        <p className="text-sm text-muted-foreground">
          Pantau, telusuri, dan verifikasi seluruh pesanan grosir Vica. Untuk mencatat pesanan baru, gunakan menu{" "}
          <Link to="/orders/new" className="font-medium text-primary hover:underline">Tambah Order</Link>.
        </p>
      </div>

      {/* Mini stats untuk hasil pemfilteran */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat icon={BoxesIcon} label="Hasil Pemfilteran" value={formatNumber(stats.count)} tone="text-primary bg-primary/10" />
        <MiniStat icon={Clock} label="Menunggu Verifikasi" value={formatNumber(stats.pending)} tone="text-warning bg-warning/15" />
        <MiniStat icon={Truck} label="Sudah Diambil" value={formatNumber(stats.delivered)} tone="text-success bg-success/15" />
        <MiniStat icon={Wallet} label="Total Nilai" value={formatIDR(stats.totalValue)} tone="text-primary-foreground bg-gradient-primary" />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" /> Pemfilteran
            </CardTitle>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <X className="mr-1 h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ID / Invoice / Kode / Hash / Nama"
                className="pl-9"
              />
            </div>
            <Select value={payment} onValueChange={(v) => setPayment(v as PaymentStatus | "all")}>
              <SelectTrigger><SelectValue placeholder="Status Pembayaran" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pembayaran</SelectItem>
                <SelectItem value="Menunggu Verifikasi">Menunggu Verifikasi</SelectItem>
                <SelectItem value="Terverifikasi">Terverifikasi</SelectItem>
                <SelectItem value="Bermasalah">Bermasalah</SelectItem>
                <SelectItem value="Gagal">Gagal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={packing} onValueChange={(v) => setPacking(v as PackingStatus | "all")}>
              <SelectTrigger><SelectValue placeholder="Status Packing" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Packing</SelectItem>
                <SelectItem value="Belum Dipacking">Belum Dipacking</SelectItem>
                <SelectItem value="Dipacking">Dipacking</SelectItem>
                <SelectItem value="Siap Diambil">Siap Diambil</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pickup} onValueChange={(v) => setPickup(v as PickupStatus | "all")}>
              <SelectTrigger><SelectValue placeholder="Status Pengambilan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pengambilan</SelectItem>
                <SelectItem value="Belum Diambil">Belum Diambil</SelectItem>
                <SelectItem value="Sudah Diambil">Sudah Diambil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Daftar Transaksi <span className="font-normal text-muted-foreground">({filtered.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">ID / Invoice</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3 text-right">Item</th>
                  <th className="p-3 text-right">Dus</th>
                  <th className="p-3 text-right">Pcs</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Pembayaran</th>
                  <th className="p-3">Packing</th>
                  <th className="p-3">Pengambilan</th>
                  <th className="p-3">Kode / Hash</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((o) => {
                  const canVerify = o.paymentStatus === "Menunggu Verifikasi";
                  return (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-mono text-xs">{o.id}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{o.invoice}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                      <td className="p-3 text-right tabular-nums">{o.items.length}</td>
                      <td className="p-3 text-right tabular-nums">{o.totalBoxes}</td>
                      <td className="p-3 text-right tabular-nums">{o.totalPcs}</td>
                      <td className="p-3 text-right font-semibold tabular-nums">{formatIDR(o.totalAmount)}</td>
                      <td className="p-3"><PaymentBadge status={o.paymentStatus} /></td>
                      <td className="p-3"><PackingBadge status={o.packingStatus} /></td>
                      <td className="p-3"><PickupBadge status={o.pickupStatus} /></td>
                      <td className="p-3">
                        <div className="font-mono text-[11px]">{o.pickupCode}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{shortHash(o.hash)}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          {canVerify && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPaymentStatus(o.id, "Terverifikasi", user.displayName, "admin");
                                toast.success(`Pembayaran ${o.id} diverifikasi`);
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-success" /> Verifikasi
                            </Button>
                          )}
                          <Button asChild variant="ghost" size="sm">
                            <Link to="/orders/$id" params={{ id: o.id }}>
                              <Eye className="mr-1 h-3.5 w-3.5" /> Detail
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={12} className="p-12 text-center text-sm text-muted-foreground">
                      {hasFilter ? "Tidak ada transaksi yang cocok dengan filter." : "Belum ada transaksi."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof BoxesIcon;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <div className="mt-1.5 font-display text-xl font-bold tracking-tight">{value}</div>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
