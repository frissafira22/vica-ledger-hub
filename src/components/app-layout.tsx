import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  Store,
  ScrollText,
  Boxes,
  LogOut,
  Blocks,
  PlusCircle,
  FileClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "gudang", "toko"] },
  { to: "/orders/new", label: "Tambah Order", icon: PlusCircle, roles: ["admin"] },
  { to: "/orders", label: "Riwayat Transaksi", icon: ScrollText, roles: ["admin"] },
  { to: "/products", label: "Master Produk", icon: Boxes, roles: ["admin"] },
  { to: "/warehouse", label: "Gudang", icon: Package, roles: ["admin", "gudang"] },
  { to: "/store", label: "Verifikasi Toko", icon: Store, roles: ["admin", "toko"] },
  { to: "/audit", label: "Audit Log", icon: FileClock, roles: ["admin"] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return <>{children}</>;

  const items = NAV.filter((i) => i.roles.includes(user.role));

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Blocks className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold">Vica BlockLedger</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Finance</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {items.map((item) => {
            const active =
              item.to === "/orders"
                ? path === "/orders" || (path.startsWith("/orders/") && path !== "/orders/new")
                : item.to === "/orders/new"
                  ? path === "/orders/new"
                  : item.to === "/dashboard"
                    ? path === "/dashboard"
                    : path === item.to || path.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 rounded-md bg-sidebar-accent/40 px-3 py-2">
            <div className="text-xs text-sidebar-foreground/60">Masuk sebagai</div>
            <div className="text-sm font-semibold">{user.displayName}</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">{user.role}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
              <Blocks className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-bold">Vica BlockLedger</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate({ to: "/" }); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <div className="md:hidden flex gap-1 overflow-x-auto border-b bg-card px-2 py-2">
          {items.map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
