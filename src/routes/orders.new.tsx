import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { formatIDR } from "@/lib/utils-format";
import { toast } from "sonner";
import type { PaymentMethod, PaymentStatus } from "@/lib/types";

export const Route = createFileRoute("/orders/new")({
  component: NewOrderPage,
});

interface ItemRow {
  productCode: string;
  boxes: number;
}

function NewOrderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { products, createOrder } = useData();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ productCode: "", boxes: 1 }]);
  const [method, setMethod] = useState<PaymentMethod>("Transfer Bank");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Menunggu Verifikasi");
  const [notes, setNotes] = useState("");

  const total = useMemo(() => {
    return items.reduce((s, it) => {
      const p = products.find((x) => x.code === it.productCode);
      return s + (p ? p.pricePerBox * it.boxes : 0);
    }, 0);
  }, [items, products]);

  const addRow = () => setItems((prev) => [...prev, { productCode: "", boxes: 1 }]);
  const removeRow = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

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
      paymentStatus,
      notes: notes.trim() || undefined,
      actor: user!.displayName,
    });
    toast.success(`Order ${order.id} dibuat`);
    navigate({ to: "/orders/$id", params: { id: order.id } });
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link to="/orders"><ArrowLeft className="mr-1 h-4 w-4" /> Kembali</Link>
          </Button>
          <h1 className="font-display text-3xl font-bold">Tambah Order</h1>
          <p className="text-sm text-muted-foreground">Catat pesanan grosir baru — bisa multi produk dalam satu transaksi.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama pelanggan</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis. Rina Store" />
              </div>
              <div>
                <Label htmlFor="phone">Nomor HP</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Detail Produk</CardTitle>
              <Button size="sm" variant="outline" onClick={addRow}><Plus className="mr-1 h-3.5 w-3.5" /> Tambah Item</Button>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pembayaran & Catatan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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
                <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
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
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Catatan opsional…" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4" /> Ringkasan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              {items.map((it, i) => {
                const p = products.find((x) => x.code === it.productCode);
                if (!p) return (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span>Item {i + 1}</span><span>—</span>
                  </div>
                );
                return (
                  <div key={i} className="flex justify-between">
                    <span className="truncate pr-2">{p.name} × {it.boxes}</span>
                    <span className="tabular-nums">{formatIDR(p.pricePerBox * it.boxes)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                <span className="font-display text-2xl font-bold text-gradient">{formatIDR(total)}</span>
              </div>
            </div>
            <Button onClick={submit} className="w-full bg-gradient-primary shadow-elegant" size="lg">
              Simpan Order & Generate Hash
            </Button>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Sistem otomatis membuat ID Transaksi, Invoice, Kode Pengambilan, dan Hash transaksi (simulasi blockchain).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
