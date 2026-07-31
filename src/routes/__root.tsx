import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-emerald grain px-4">
      <div className="max-w-md text-center text-cream">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Lost in the atelier</p>
        <h1 className="font-display italic text-7xl mt-4">404</h1>
        <p className="mt-4 text-cream/70">
          The page you're looking for has been moved or never existed.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-gold-brand px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-semibold text-forest-brand hover:bg-gold-light transition-colors"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display italic text-3xl text-forest-brand">Something slipped</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A rare hiccup on our end. Try again or return home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center rounded-full bg-emerald-brand px-6 py-2.5 text-xs uppercase tracking-widest font-medium text-cream hover:bg-forest-brand transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-full border border-border px-6 py-2.5 text-xs uppercase tracking-widest font-medium text-foreground hover:bg-muted transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Suiikala — Handcrafted Jewellery & Gifting from Surat" },
      {
        name: "description",
        content:
          "Suiikala crafts heirloom-quality jewellery, silk accessories, and premium gifting hampers in Surat, India. Emerald & gold, made to be passed down.",
      },
      { name: "author", content: "Suii Kala" },
      { property: "og:title", content: "Suiikala — Handcrafted Jewellery & Gifting" },
      {
        property: "og:description",
        content: "Heirloom-quality jewellery and gifting hampers, handcrafted in Surat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#14532D" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <Outlet />
          <Toaster position="top-center" richColors />
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
