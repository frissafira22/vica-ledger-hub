import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIDR } from "@/lib/utils-format";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { products, updateProductPrice } = useData();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<number>(0);

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Master Produk</h1>
        <p className="text-sm text-muted-foreground">Katalog produk Vica. Admin dapat mengubah harga per dus.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Daftar Produk ({products.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Isi/Dus</th>
                  <th className="p-3 text-right">Harga/Dus</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.code} className="hover:bg-muted/20">
                    <td className="p-3 font-mono text-xs">{p.code}</td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.category}</span></td>
                    <td className="p-3 text-right tabular-nums">{p.unitsPerBox}</td>
                    <td className="p-3 text-right">
                      {editing === p.code ? (
                        <Input
                          type="number"
                          value={draft}
                          onChange={(e) => setDraft(parseInt(e.target.value) || 0)}
                          className="h-8 text-right"
                        />
                      ) : (
                        <span className="font-semibold tabular-nums">{formatIDR(p.pricePerBox)}</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editing === p.code ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (draft <= 0) return toast.error("Harga harus > 0");
                              updateProductPrice(p.code, draft);
                              setEditing(null);
                              toast.success(`Harga ${p.code} diperbarui`);
                            }}
                          >
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(p.code);
                            setDraft(p.pricePerBox);
                          }}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
