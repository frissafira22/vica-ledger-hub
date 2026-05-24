import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { DataProvider } from "@/lib/data-store";
import { ThemeProvider } from "@/lib/theme";
import { SolanaProvider } from "@/lib/solana";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">Halaman yang Anda cari tidak tersedia.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vica BlockLedger Finance" },
      { name: "description", content: "Pembukuan & verifikasi pembayaran grosir Vica berbasis konsep blockchain (simulasi)." },
      { property: "og:title", content: "Vica BlockLedger Finance" },
      { property: "og:description", content: "Pembukuan & verifikasi pembayaran grosir Vica berbasis konsep blockchain (simulasi)." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Vica BlockLedger Finance" },
      { name: "twitter:description", content: "Pembukuan & verifikasi pembayaran grosir Vica berbasis konsep blockchain (simulasi)." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/77c5dfd7-e234-4b51-9c54-fa256158d5ca/id-preview-53117ff5--7ac768b9-9f75-46cd-a004-7689a6aaec33.lovable.app-1779550959685.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/77c5dfd7-e234-4b51-9c54-fa256158d5ca/id-preview-53117ff5--7ac768b9-9f75-46cd-a004-7689a6aaec33.lovable.app-1779550959685.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <SolanaProvider>
        <AuthProvider>
          <DataProvider>
            <AppLayout>
              <Outlet />
            </AppLayout>
            <Toaster richColors position="top-right" />
          </DataProvider>
        </AuthProvider>
      </SolanaProvider>
    </ThemeProvider>
  );
}
