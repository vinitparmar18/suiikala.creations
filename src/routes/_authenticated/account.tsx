import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { LogOut, Package, MapPin, Heart, User as UserIcon, Settings } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — Suiikala" },
      { name: "description", content: "Manage your Suiikala profile, orders, addresses, and wishlist." },
      { property: "og:title", content: "My Account — Suiikala" },
      { property: "og:description", content: "Manage your Suiikala account." },
    ],
  }),
  component: AccountLayout,
});

const items: { to: string; label: string; icon: typeof UserIcon; exact?: boolean }[] = [
  { to: "/account", label: "Profile", icon: UserIcon, exact: true },
  { to: "/account/orders", label: "My Orders", icon: Package },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/settings", label: "Settings", icon: Settings },
];

function AccountLayout() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />
      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 py-12 flex-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-3">Members area</p>
        <h1 className="font-display italic text-4xl md:text-5xl text-forest-brand">
          {user?.user_metadata?.full_name ? `Hello, ${user.user_metadata.full_name.split(" ")[0]}` : "My Account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          <aside className="space-y-1">
            {items.map((i) => {
              const active = i.exact ? loc.pathname === i.to : loc.pathname.startsWith(i.to);
              return (
                <Link
                  key={i.to}
                  to={i.to}
                  className={`flex items-center gap-3 px-4 py-3 text-sm border-l-2 transition-colors ${
                    active
                      ? "border-emerald-brand bg-secondary/50 text-forest-brand font-medium"
                      : "border-transparent text-muted-foreground hover:text-forest-brand hover:bg-secondary/30"
                  }`}
                >
                  <i.icon className="size-4" /> {i.label}
                </Link>
              );
            })}
            <button
              onClick={async () => {
                await signOut();
                nav({ to: "/" });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive border-l-2 border-transparent"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </aside>
          <main>
            <Outlet />
          </main>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
