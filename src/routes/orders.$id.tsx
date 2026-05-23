import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentBadge, PackingBadge, PickupBadge } from "@/components/status-badges";
import { formatIDR, formatDateTime } from "@/lib/utils-format";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Hash, Receipt, KeyRound, Link2 } from "lucide-react";
import { toast } from "sonner";
import { useChainSubmit } from "@/lib/use-chain-submit";
import { WalletStatusBanner } from "@/components/wallet-connect";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams({ from: "/orders/$id" });
  const { orders, audit, blockchain, setPaymentStatus, markIssue } = useData();
  const submitChain = useChainSubmit();
  const order = orders.find((o) => o.id === id);
  const logs = audit.filter((a) => a.orderId === id).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const chainLogs = blockchain.filter((b) => b.orderId === id);

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  if (!user) return null;
  if (!order) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card><CardContent className="p-10 text-center text-muted-foreground">Transaksi tidak ditemukan.</CardContent></Card>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link to="/orders"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Link>
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{order.id}</span>
            <span>·</span>
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
          <h1 className="font-display text-3xl font-bold">{order.customerName}</h1>
          <div className="mt-1 text-sm text-muted-foreground">{order.customerPhone}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <PaymentBadge status={order.paymentStatus} />
          <PackingBadge status={order.packingStatus} />
          <PickupBadge status={order.pickupStatus} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Receipt className="h-3.5 w-3.5" /> Invoice</div>
          <div className="font-mono text-sm font-semibold mt-1">{order.invoice}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><KeyRound className="h-3.5 w-3.5" /> Kode Pengambilan</div>
          <div className="font-mono text-sm font-semibold mt-1">{order.pickupCode}</div>
        </CardContent></Card>
        <Card className="bg-gradient-primary text-primary-foreground border-0"><CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs opacity-80"><Hash className="h-3.5 w-3.5" /> Hash Transaksi</div>
          <div className="font-mono text-[11px] break-all mt-1 leading-relaxed">{order.hash}</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Item Produk</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-3">Produk</th><th className="p-3 text-right">Dus</th><th className="p-3 text-right">Isi/Dus</th><th className="p-3 text-right">Total Pcs</th><th className="p-3 text-right">Harga/Dus</th><th className="p-3 text-right">Subtotal</th></tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((it) => (
                  <tr key={it.productCode}>
                    <td className="p-3">
                      <div className="font-medium">{it.productName}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{it.productCode}</div>
                    </td>
                    <td className="p-3 text-right tabular-nums">{it.boxes}</td>
                    <td className="p-3 text-right tabular-nums">{it.unitsPerBox}</td>
                    <td className="p-3 text-right tabular-nums">{it.boxes * it.unitsPerBox}</td>
                    <td className="p-3 text-right tabular-nums">{formatIDR(it.pricePerBox)}</td>
                    <td className="p-3 text-right font-semibold tabular-nums">{formatIDR(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 font-semibold">
                <tr>
                  <td className="p-3" colSpan={3}>Total</td>
                  <td className="p-3 text-right tabular-nums">{order.totalPcs}</td>
                  <td className="p-3"></td>
                  <td className="p-3 text-right text-base tabular-nums text-gradient">{formatIDR(order.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Audit Log</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border pl-5">
              {logs.map((l) => (
                <li key={l.id} className="relative">
                  <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-gradient-primary ring-4 ring-background" />
                  <div className="text-sm font-medium">{l.activity}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(l.timestamp)} · <span className="uppercase">{l.role}</span> · {l.actor}
                  </div>
                  {l.notes && <div className="mt-1 text-xs text-muted-foreground">Catatan: {l.notes}</div>}
                </li>
              ))}
            </ol>

            {chainLogs.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5" /> Blockchain Records ({chainLogs.length})
                </div>
                <div className="space-y-2">
                  {chainLogs.map((b) => (
                    <div key={b.id} className="rounded-md border bg-muted/30 p-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{b.actionLabel}</span>
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] uppercase text-success">{b.status}</span>
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground break-all">tx: {b.txHash}</div>
                      <div className="text-[11px] text-muted-foreground">{formatDateTime(b.timestamp)} · {b.network}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Metode" value={order.paymentMethod} />
            <Row label="Total Item" value={`${order.items.length}`} />
            <Row label="Total Dus" value={`${order.totalBoxes}`} />
            <Row label="Total Pcs" value={`${order.totalPcs}`} />
            <Row label="Dibuat oleh" value={order.createdBy} />
            {order.notes && <div><div className="text-xs text-muted-foreground">Catatan</div><div>{order.notes}</div></div>}

            {isAdmin && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Aksi Admin</div>
                <WalletStatusBanner />
                {order.paymentStatus !== "Terverifikasi" && order.paymentStatus !== "Gagal" && (
                  <Button
                    size="sm"
                    className="w-full justify-start"
                    onClick={async () => {
                      setPaymentStatus(order.id, "Terverifikasi", user.displayName, "admin");
                      toast.success("Pembayaran diverifikasi");
                      await submitChain({ orderId: order.id, orderHash: order.hash, action: "VERIFY_PAYMENT" });
                    }}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Verifikasi Pembayaran
                  </Button>
                )}
                {order.paymentStatus !== "Bermasalah" && order.pickupStatus !== "Sudah Diambil" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={async () => {
                      markIssue(order.id, user.displayName, "admin");
                      toast.warning("Transaksi ditandai bermasalah");
                      await submitChain({ orderId: order.id, orderHash: order.hash, action: "MARK_ISSUE" });
                    }}
                  >
                    <AlertTriangle className="mr-1.5 h-4 w-4 text-warning" /> Tandai Bermasalah
                  </Button>
                )}
                {order.paymentStatus !== "Gagal" && order.pickupStatus !== "Sudah Diambil" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setPaymentStatus(order.id, "Gagal", user.displayName, "admin");
                      toast.error("Transaksi ditandai gagal");
                    }}
                  >
                    <XCircle className="mr-1.5 h-4 w-4 text-destructive" /> Tandai Gagal
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
