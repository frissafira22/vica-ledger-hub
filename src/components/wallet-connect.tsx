import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function shortAddr(a?: string) {
  if (!a) return "";
  return a.slice(0, 6) + "…" + a.slice(-4);
}

export function WalletConnectButton({ className }: { className?: string }) {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const injectedConnector = connectors[0];

  if (isConnected && address) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="hidden flex-col items-end leading-tight sm:flex">
          <span className="font-mono text-xs">{shortAddr(address)}</span>
          <span className="text-[10px] text-muted-foreground">{chain?.name ?? "Wallet"}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            disconnect();
            toast.message("Wallet disconnected");
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="ml-1 hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  const hasInjected =
    typeof window !== "undefined" && !!(window as unknown as { ethereum?: unknown }).ethereum;

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        if (!hasInjected) {
          toast.error("Wallet tidak terdeteksi", {
            description: "Pasang MetaMask atau wallet injected lain untuk mengaktifkan integrasi blockchain.",
          });
          return;
        }
        if (!injectedConnector) {
          toast.error("Connector wallet belum siap");
          return;
        }
        connect({ connector: injectedConnector });
      }}
      className={cn("gap-1.5", className)}
    >
      {hasInjected ? <Wallet className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
      <span>{isPending ? "Menghubungkan…" : "Connect Wallet"}</span>
    </Button>
  );
}

export function WalletStatusBanner() {
  const { isConnected } = useAccount();
  if (isConnected) return null;
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-warning" />
        <div>
          <div className="font-medium">Wallet belum terhubung</div>
          <div className="text-muted-foreground">
            Aksi blockchain (verifikasi, packing, pengambilan, bermasalah) akan tetap berjalan
            sebagai prototype lokal. Connect wallet untuk merekam aksi ke blockchain (simulasi).
          </div>
        </div>
      </div>
    </div>
  );
}
