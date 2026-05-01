import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatDateTime } from "@/lib/utils-format";

export const Route = createFileRoute("/audit")({
  component: AuditPage,
});

function AuditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { audit } = useData();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) navigate({ to: "/" });
    else if (user.role !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...audit]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .filter((a) => {
        if (!term) return true;
        return (
          a.id.toLowerCase().includes(term) ||
          a.orderId.toLowerCase().includes(term) ||
          a.activity.toLowerCase().includes(term) ||
          a.role.toLowerCase().includes(term) ||
          a.actor.toLowerCase().includes(term)
        );
      });
  }, [audit, q]);

  if (!user || user.role !== "admin") return null;

  const roleColor: Record<string, string> = {
    admin: "bg-primary/15 text-primary",
    gudang: "bg-info/15 [color:var(--info)]",
    toko: "bg-accent/25 text-accent-foreground",
    system: "bg-muted text-muted-foreground",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">Catatan seluruh aktivitas pada sistem (immutable simulation).</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Total Entri: {filtered.length}</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ID / aktivitas / role…" className="pl-9 sm:w-72" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">ID Audit</th>
                  <th className="p-3">ID Transaksi</th>
                  <th className="p-3">Aktivitas</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Aktor</th>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20">
                    <td className="p-3 font-mono text-xs">{a.id}</td>
                    <td className="p-3 font-mono text-xs">
                      <Link to="/orders/$id" params={{ id: a.orderId }} className="text-primary hover:underline">
                        {a.orderId}
                      </Link>
                    </td>
                    <td className="p-3">{a.activity}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase ${roleColor[a.role] || "bg-muted"}`}>
                        {a.role}
                      </span>
                    </td>
                    <td className="p-3">{a.actor}</td>
                    <td className="p-3 text-xs text-muted-foreground">{formatDateTime(a.timestamp)}</td>
                    <td className="p-3 text-xs text-muted-foreground">{a.notes || "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-12 text-center text-sm text-muted-foreground">Tidak ada entri.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
