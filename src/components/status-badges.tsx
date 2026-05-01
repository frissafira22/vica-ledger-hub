import type { PackingStatus, PaymentStatus, PickupStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap";

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    "Menunggu Verifikasi": "bg-warning/15 text-warning-foreground ring-warning/30 [color:var(--warning)]",
    Terverifikasi: "bg-success/15 ring-success/30 [color:var(--success)]",
    Bermasalah: "bg-destructive/10 text-destructive ring-destructive/30",
    Gagal: "bg-muted text-muted-foreground ring-border",
  };
  return (
    <span className={cn(base, map[status])}>
      <Dot status={status} />
      {status}
    </span>
  );
}

export function PackingBadge({ status }: { status: PackingStatus }) {
  const map: Record<PackingStatus, string> = {
    "Belum Dipacking": "bg-muted text-muted-foreground ring-border",
    Dipacking: "bg-info/15 ring-info/30 [color:var(--info)]",
    "Siap Diambil": "bg-accent/20 text-accent-foreground ring-accent/40",
  };
  return <span className={cn(base, map[status])}>{status}</span>;
}

export function PickupBadge({ status }: { status: PickupStatus }) {
  const map: Record<PickupStatus, string> = {
    "Belum Diambil": "bg-muted text-muted-foreground ring-border",
    "Sudah Diambil": "bg-success/15 ring-success/30 [color:var(--success)]",
  };
  return <span className={cn(base, map[status])}>{status}</span>;
}

function Dot({ status }: { status: PaymentStatus }) {
  const color: Record<PaymentStatus, string> = {
    "Menunggu Verifikasi": "bg-warning",
    Terverifikasi: "bg-success",
    Bermasalah: "bg-destructive",
    Gagal: "bg-muted-foreground",
  };
  return <span className={cn("h-1.5 w-1.5 rounded-full", color[status])} />;
}
