import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Blocks, Shield, Package, Store, ArrowRight, ShieldCheck, Hash, FileLock2 } from "lucide-react";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("vica-auth-v1");
        if (raw) throw redirect({ to: "/dashboard" });
      } catch (e) {
        if (e && (e as { isRedirect?: boolean }).isRedirect) throw e;
      }
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const enter = (role: Role) => {
    login(role);
    navigate({ to: "/dashboard" });
  };

  const roles: { role: Role; title: string; desc: string; icon: typeof Shield; tone: string }[] = [
    {
      role: "admin",
      title: "Admin",
      desc: "Catat order, kelola produk, verifikasi pembayaran, audit log.",
      icon: Shield,
      tone: "from-primary to-primary-glow",
    },
    {
      role: "gudang",
      title: "Staf Gudang",
      desc: "Proses packing untuk order yang sudah terverifikasi.",
      icon: Package,
      tone: "from-info to-accent",
    },
    {
      role: "toko",
      title: "Staf Toko",
      desc: "Verifikasi & konfirmasi pengambilan barang oleh pelanggan.",
      icon: Store,
      tone: "from-accent to-primary-glow",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
            <Blocks className="h-7 w-7 text-white" />
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/70">Prototype · Simulation</div>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Vica <span className="text-accent">BlockLedger</span> Finance
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            Pembukuan dan verifikasi pembayaran pesanan grosir Vica berbasis konsep blockchain — hash transaksi,
            audit log, dan smart contract simulation.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
              <Hash className="h-3 w-3" /> Hash Transaksi
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
              <FileLock2 className="h-3 w-3" /> Audit Log
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
              <ShieldCheck className="h-3 w-3" /> Smart Contract Sim
            </span>
          </div>
        </div>

        <div className="grid w-full gap-4 md:grid-cols-3">
          {roles.map((r) => (
            <Card
              key={r.role}
              className="group cursor-pointer border-white/10 bg-white/5 backdrop-blur transition-all hover:bg-white/10 hover:shadow-glow"
              onClick={() => enter(r.role)}
            >
              <CardHeader>
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${r.tone}`}>
                  <r.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-white">{r.title}</CardTitle>
                <CardDescription className="text-white/70">{r.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full justify-between">
                  Masuk sebagai {r.title}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-white/60">
          Sistem prototype — tidak memproses pembayaran nyata, tidak menggunakan crypto / wallet / integrasi bank.
        </p>
      </div>
    </div>
  );
}
