import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR, formatNumber } from "@/lib/utils-format";
import {
  Boxes,
  Clock,
  CheckCircle2,
  PackageCheck,
  PackageOpen,
  Truck,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders } = useData();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  const stats = useMemo(() => {
    const total = orders.length;
    const menunggu = orders.filter((o) => o.paymentStatus === "Menunggu Verifikasi").length;
    const verified = orders.filter((o) => o.paymentStatus === "Terverifikasi").length;
    const dipacking = orders.filter((o) => o.packingStatus === "Dipacking").length;
    const siap = orders.filter((o) => o.packingStatus === "Siap Diambil" && o.pickupStatus === "Belum Diambil").length;
    const sudah = orders.filter((o) => o.pickupStatus === "Sudah Diambil").length;
    const issue = orders.filter((o) => o.paymentStatus === "Bermasalah" || o.paymentStatus === "Gagal").length;
    const value = orders
      .filter((o) => o.paymentStatus !== "Gagal")
      .reduce((s, o) => s + o.totalAmount, 0);
    return { total, menunggu, verified, dipacking, siap, sudah, issue, value };
  }, [orders]);

  if (!user) return null;

  const cards: { label: string; value: string; icon: LucideIcon; tone: string }[] = [
    { label: "Total Order", value: formatNumber(stats.total), icon: Boxes, tone: "text-primary bg-primary/10" },
    { label: "Menunggu Verifikasi", value: formatNumber(stats.menunggu), icon: Clock, tone: "text-warning bg-warning/15" },
    { label: "Terverifikasi", value: formatNumber(stats.verified), icon: CheckCircle2, tone: "text-success bg-success/15" },
    { label: "Dipacking", value: formatNumber(stats.dipacking), icon: PackageOpen, tone: "text-info bg-info/15" },
    { label: "Siap Diambil", value: formatNumber(stats.siap), icon: PackageCheck, tone: "text-accent-foreground bg-accent/25" },
    { label: "Sudah Diambil", value: formatNumber(stats.sudah), icon: Truck, tone: "text-success bg-success/15" },
    { label: "Bermasalah / Gagal", value: formatNumber(stats.issue), icon: AlertTriangle, tone: "text-destructive bg-destructive/10" },
    { label: "Total Nilai Order", value: formatIDR(stats.value), icon: Wallet, tone: "text-primary bg-gradient-primary text-primary-foreground" },
  ];

  const recent = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Ringkasan</div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Selamat datang, <span className="font-medium text-foreground">{user.displayName}</span>. Pantau alur transaksi grosir Vica secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">{c.label}</div>
                  <div className="mt-1.5 font-display text-2xl font-bold tracking-tight">{c.value}</div>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.tone}`}>
                  <c.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">Belum ada transaksi.</div>
          )}
          {recent.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="min-w-0">
                <div className="font-mono text-xs text-muted-foreground">{o.id} · {o.invoice}</div>
                <div className="truncate font-medium">{o.customerName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.items.length} item · {o.totalBoxes} dus · {formatIDR(o.totalAmount)}
                </div>
              </div>
              <div className="ml-3 flex flex-col items-end gap-1 text-xs">
                <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{o.paymentStatus}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{o.packingStatus}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
