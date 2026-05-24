import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentBadge, PackingBadge, PickupBadge } from "@/components/status-badges";
import { formatIDR, formatNumber, shortHash, formatDateTime } from "@/lib/utils-format";
import {
  Search,
  Eye,
  CheckCircle2,
  Filter,
  X,
  Wallet,
  Boxes as BoxesIcon,
  Clock,
  Truck,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import type { PaymentStatus, PackingStatus, PickupStatus, PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSolanaSubmit } from "@/lib/use-solana-submit";
import { WalletStatusBanner } from "@/components/wallet-connect";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

interface ItemRow {
  productCode: string;
  boxes: number;
}

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, products, createOrder, setPaymentStatus } = useData();
  const submitChain = useSolanaSubmit();

  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ productCode: "", boxes: 1 }]);
  const [method, setMethod] = useState<PaymentMethod>("Transfer Bank");
  const [paymentStatusForm, setPaymentStatusForm] = useState<PaymentStatus>("Menunggu Verifikasi");
  const [notes, setNotes] = useState("");

  // Filter state
  const [q, setQ] = useState("");
  const [payment, setPayment] = useState<PaymentStatus | "all">("all");
  const [packing, setPacking] = useState<PackingStatus | "all">("all");
  const [pickup, setPickup] = useState<PickupStatus | "all">("all");

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const formTotal = useMemo(() => {
    return items.reduce((s, it) => {
      const p = products.find((x) => x.code === it.productCode);
      return s + (p ? p.pricePerBox * it.boxes : 0);
    }, 0);
  }, [items, products]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setItems([{ productCode: "", boxes: 1 }]);
    setMethod("Transfer Bank");
    setPaymentStatusForm("Menunggu Verifikasi");
    setNotes("");
  };

  const submit = () => {
    if (!name.trim()) return toast.error("Nama pelanggan wajib diisi");
    if (!phone.trim()) return toast.error("Nomor HP wajib diisi");
    const valid = items.filter((i) => i.productCode && i.boxes > 0);
    if (valid.length === 0) return toast.error("Tambahkan minimal 1 produk");

    const order = createOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      items: valid,
      paymentMethod: method,
      paymentStatus: paymentStatusForm,
      notes: notes.trim() || undefined,
      actor: user!.displayName,
    });
    toast.success(`Order ${order.id} dibuat`);
    resetForm();
    setShowForm(false);
  };

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
    const pending = filtered.filter((o) => o.paymentStatus === "Menunggu Verifikasi").length;
    const delivered = filtered.filter((o) => o.pickupStatus === "Sudah Diambil").length;
    return { count: filtered.length, totalValue, pending, delivered };
  }, [filtered]);

  const hasFilter = q || payment !== "all" || packing !== "all" || pickup !== "all";
  const resetFilter = () => {
    setQ("");
    setPayment("all");
    setPacking("all");
    setPickup("all");
  };

  const addRow = () => setItems((prev) => [...prev, { productCode: "", boxes: 1 }]);
  const removeRow = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  if (!user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Pembukuan</div>
          <h1 className="font-display text-3xl font-bold">Transaksi</h1>
          <p className="text-sm text-muted-foreground">Catat pesanan baru dan pantau seluruh riwayat transaksi grosir Vica.</p>
        </div>
        <Button
          size="lg"
          className={cn("shadow-elegant", showForm ? "" : "bg-gradient-primary")}
          variant={showForm ? "outline" : "default"}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? (
            <><ChevronUp className="mr-1.5 h-4 w-4" /> Tutup Form</>
          ) : (
            <><Plus className="mr-1.5 h-4 w-4" /> Tambah Order</>
          )}
        </Button>
      </div>

      <WalletStatusBanner />

      {/* Form Tambah Order (collapsible) */}
      {showForm && (
        <Card className="border-primary/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4" /> Form Tambah Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama pelanggan</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis. Rina Store" />
              </div>
              <div>
                <Label htmlFor="phone">Nomor HP</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812..." />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Detail Produk</Label>
                <Button size="sm" variant="outline" onClick={addRow}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Item
                </Button>
              </div>
              {items.map((it, i) => {
                const p = products.find((x) => x.code === it.productCode);
                const subtotal = p ? p.pricePerBox * it.boxes : 0;
                return (
                  <div key={i} className="grid gap-3 rounded-lg border bg-muted/20 p-3 md:grid-cols-12 md:items-end">
                    <div className="md:col-span-5">
                      <Label className="text-xs">Produk</Label>
                      <Select
                        value={it.productCode}
                        onValueChange={(v) =>
                          setItems((prev) => prev.map((row, idx) => (idx === i ? { ...row, productCode: v } : row)))
                        }
                      >
                        <SelectTrigger><SelectValue placeholder="Pilih dari katalog" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.code} value={p.code}>
                              <span className="font-mono text-[11px] mr-2 text-muted-foreground">{p.code}</span>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Jumlah Dus</Label>
                      <Input
                        type="number"
                        min={1}
                        value={it.boxes}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row, idx) =>
                              idx === i ? { ...row, boxes: Math.max(1, parseInt(e.target.value) || 1) } : row,
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Isi/dus · Pcs</Label>
                      <div className="rounded-md bg-background px-3 py-2 text-sm">
                        {p ? `${p.unitsPerBox} · ${p.unitsPerBox * it.boxes}` : "—"}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Subtotal</Label>
                      <div className="rounded-md bg-background px-3 py-2 text-sm font-semibold tabular-nums">
                        {formatIDR(subtotal)}
                      </div>
                    </div>
                    <div className="md:col-span-1 flex md:justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(i)}
                        disabled={items.length === 1}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Metode pembayaran</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                    <SelectItem value="Dompet Digital">Dompet Digital</SelectItem>
                    <SelectItem value="Tunai">Tunai</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status pembayaran</Label>
                <Select value={paymentStatusForm} onValueChange={(v) => setPaymentStatusForm(v as PaymentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Menunggu Verifikasi">Menunggu Verifikasi</SelectItem>
                    <SelectItem value="Terverifikasi">Terverifikasi</SelectItem>
                    <SelectItem value="Bermasalah">Bermasalah</SelectItem>
                    <SelectItem value="Gagal">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Catatan</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Catatan opsional…" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div>
                <div className="text-xs text-muted-foreground">Total Pembayaran</div>
                <div className="font-display text-2xl font-bold text-gradient">{formatIDR(formTotal)}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { resetForm(); setShowForm(false); }}>Batal</Button>
                <Button onClick={submit} className="bg-gradient-primary shadow-elegant">
                  Simpan Order & Generate Hash
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mini stats */}
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
              <Button variant="ghost" size="sm" onClick={resetFilter}>
                <X className="mr-1 h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <div className="relative">
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
                              onClick={async () => {
                                setPaymentStatus(o.id, "Terverifikasi", user.displayName, "admin");
                                toast.success(`Pembayaran ${o.id} diverifikasi`);
                                await submitChain({ orderId: o.id, orderHash: o.hash, action: "PAYMENT_VERIFIED" });
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
