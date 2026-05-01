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
import { formatIDR, shortHash } from "@/lib/utils-format";
import { Plus, Search, Eye } from "lucide-react";
import type { PaymentStatus } from "@/lib/types";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders } = useData();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders
      .filter((o) => filter === "all" || o.paymentStatus === filter)
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
  }, [orders, q, filter]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Riwayat Transaksi</h1>
          <p className="text-sm text-muted-foreground">Semua pesanan grosir Vica beserta status lengkapnya.</p>
        </div>
        <Button asChild>
          <Link to="/orders/new"><Plus className="mr-1.5 h-4 w-4" /> Tambah Order</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Daftar Transaksi ({filtered.length})</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari ID / Invoice / Kode / Hash / Nama"
                className="pl-9 sm:w-72"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as PaymentStatus | "all")}>
              <SelectTrigger className="sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua status pembayaran</SelectItem>
                <SelectItem value="Menunggu Verifikasi">Menunggu Verifikasi</SelectItem>
                <SelectItem value="Terverifikasi">Terverifikasi</SelectItem>
                <SelectItem value="Bermasalah">Bermasalah</SelectItem>
                <SelectItem value="Gagal">Gagal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">ID / Invoice</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3 text-right">Item</th>
                  <th className="p-3 text-right">Dus</th>
                  <th className="p-3 text-right">Pcs</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Pembayaran</th>
                  <th className="p-3">Packing</th>
                  <th className="p-3">Pengambilan</th>
                  <th className="p-3">Kode / Hash</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-mono text-xs">{o.id}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{o.invoice}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                    </td>
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
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/orders/$id" params={{ id: o.id }}>
                          <Eye className="mr-1 h-3.5 w-3.5" /> Detail
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-12 text-center text-sm text-muted-foreground">
                      Tidak ada transaksi yang cocok.
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
