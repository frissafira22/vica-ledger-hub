import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackingBadge } from "@/components/status-badges";
import { formatIDR, formatDateTime } from "@/lib/utils-format";
import { Package, PackageCheck, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { useChainSubmit } from "@/lib/use-chain-submit";
import { WalletStatusBanner } from "@/components/wallet-connect";

export const Route = createFileRoute("/warehouse")({
  component: WarehousePage,
});

function WarehousePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, setPackingStatus } = useData();
  const submitChain = useChainSubmit();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin" && user.role !== "gudang") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const visible = useMemo(
    () =>
      orders
        .filter((o) => o.paymentStatus === "Terverifikasi" && o.pickupStatus === "Belum Diambil")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [orders],
  );

  if (!user || (user.role !== "admin" && user.role !== "gudang")) return null;

  const queue = visible.filter((o) => o.packingStatus === "Belum Dipacking");
  const packing = visible.filter((o) => o.packingStatus === "Dipacking");
  const ready = visible.filter((o) => o.packingStatus === "Siap Diambil");

  const Column = ({
    title,
    icon: Icon,
    list,
    action,
    actionLabel,
    nextStatus,
  }: {
    title: string;
    icon: typeof Package;
    list: typeof orders;
    action?: boolean;
    actionLabel?: string;
    nextStatus?: "Dipacking" | "Siap Diambil";
  }) => (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{list.length}</span>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        {list.length === 0 && (
          <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
            Tidak ada order
          </div>
        )}
        {list.map((o) => (
          <div key={o.id} className="rounded-lg border bg-card p-3 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-muted-foreground">{o.id}</div>
                <div className="truncate font-medium">{o.customerName}</div>
              </div>
              <PackingBadge status={o.packingStatus} />
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {o.items.map((it) => (
                <div key={it.productCode} className="flex justify-between">
                  <span className="truncate pr-2">{it.productName}</span>
                  <span className="font-mono">{it.boxes} dus · {it.boxes * it.unitsPerBox} pcs</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{formatDateTime(o.createdAt)}</span>
              <span className="font-semibold">{formatIDR(o.totalAmount)}</span>
            </div>
            {action && nextStatus && (
              <Button
                size="sm"
                className="mt-3 w-full bg-gradient-primary"
                onClick={async () => {
                  setPackingStatus(o.id, nextStatus, user.displayName, "gudang");
                  toast.success(nextStatus === "Dipacking" ? "Mulai packing" : "Ditandai siap diambil");
                  await submitChain({
                    orderId: o.id,
                    orderHash: o.hash,
                    action: nextStatus === "Dipacking" ? "START_PACKING" : "MARK_READY",
                  });
                }}
              >
                {actionLabel}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Gudang</h1>
        <p className="text-sm text-muted-foreground">
          Hanya order dengan pembayaran terverifikasi dan belum diambil yang ditampilkan.
        </p>
      </div>
      <WalletStatusBanner />
      <div className="grid gap-4 lg:grid-cols-3">
        <Column title="Antrian Packing" icon={Package} list={queue} action actionLabel="Mulai Packing" nextStatus="Dipacking" />
        <Column title="Sedang Dipacking" icon={PackageOpen} list={packing} action actionLabel="Tandai Siap Diambil" nextStatus="Siap Diambil" />
        <Column title="Siap Diambil" icon={PackageCheck} list={ready} />
      </div>
    </div>
  );
}
