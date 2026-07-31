import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Ticket, Image as ImageIcon, Star, Settings as SettingsIcon, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isAuthenticatedUserAdmin } from "@/lib/auth-session";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const admin = await isAuthenticatedUserAdmin();
    if (!admin) throw redirect({ to: "/account" });
  },
  component: AdminLayout,
});

const items: Array<{ to: string; label: string; icon: any; exact?: boolean }> = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/banners", label: "Banners & CMS", icon: ImageIcon },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/users", label: "Admin Users", icon: ShieldCheck },
  { to: "/admin/settings", label: "Store Settings", icon: SettingsIcon },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut, user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-brand via-forest-brand to-emerald-brand text-cream">
      <div className="grid lg:grid-cols-[260px_1fr] min-h-screen">
        <aside className="border-r border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="font-display italic text-2xl text-gold-brand">Suiikala</Link>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-cream/60">Atelier Admin</p>
          </div>
          <nav className="p-3 space-y-1">
            {items.map((it) => {
              const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
              return (
                <Link key={it.to} to={it.to as any} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-gold-brand/20 text-gold-brand" : "text-cream/70 hover:bg-white/5 hover:text-cream"}`}>
                  <it.icon className="size-4" /> {it.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10 mt-auto">
            <p className="text-xs text-cream/60 truncate">{user?.email}</p>
            <button onClick={signOut} className="mt-2 flex items-center gap-2 text-xs text-cream/70 hover:text-gold-brand">
              <LogOut className="size-3" /> Sign out
            </button>
          </div>
        </aside>
        <main className="p-6 lg:p-10 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
