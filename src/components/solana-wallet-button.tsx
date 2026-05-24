import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function shortAddr(a?: string) {
  if (!a) return "";
  return a.slice(0, 4) + "…" + a.slice(-4);
}

export function SolanaWalletButton({ className }: { className?: string }) {
  const { publicKey, connected, disconnect, connecting, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const addr = publicKey?.toBase58();

  if (connected && addr) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="hidden flex-col items-end leading-tight sm:flex">
          <span className="font-mono text-xs">{shortAddr(addr)}</span>
          <span className="text-[10px] text-muted-foreground">{wallet?.adapter.name ?? "Solana"} · Devnet</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await disconnect();
            toast.message("Wallet disconnected");
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="ml-1 hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={connecting}
      onClick={() => setVisible(true)}
      className={cn("gap-1.5", className)}
    >
      <Wallet className="h-3.5 w-3.5" />
      <span>{connecting ? "Menghubungkan…" : "Connect Wallet"}</span>
    </Button>
  );
}

export function SolanaWalletBanner() {
  const { connected } = useWallet();
  if (connected) return null;
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-warning" />
        <div>
          <div className="font-medium">Hubungkan wallet Solana terlebih dahulu.</div>
          <div className="text-muted-foreground">
            Aksi tetap berjalan sebagai prototype lokal. Connect Phantom atau Solflare (Devnet)
            untuk mencatat aktivitas ke Solana Devnet.
          </div>
        </div>
      </div>
    </div>
  );
}
