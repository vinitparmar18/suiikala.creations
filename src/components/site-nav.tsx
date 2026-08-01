import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, User, Menu, X, LogOut, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { amIAdmin } from "@/lib/admin.functions";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const { cartCount, wishlistCount } = useStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: adminInfo } = useQuery({ queryKey: ["me-admin", user?.id], queryFn: () => amIAdmin(), enabled: !!user });
  const isAdmin = !!adminInfo?.admin;
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");

  // Lock body scroll while the mobile drawer is open so the background page can't scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false); // Fix: searchOpen ki jagah setSearchOpen kiya gaya hai
    setOpen(false);
    setTerm("");
    navigate({ to: "/search", search: { q } as never });
  };
  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-foreground/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 sm:gap-4 px-4 sm:px-6 lg:px-10">
          <button
            className="lg:hidden -ml-1 p-2 text-foreground/70 shrink-0" 
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

        
          <Link
            to="/"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <img 
              src="/log.jpeg" 
              alt="Suiikala Logo"
              className="h-8 w-auto object-contain rounded-md transition-transform group-hover:scale-105" 
            />
            <span className="font-display italic text-xl sm:text-2xl font-bold tracking-tight text-emerald-brand">
              Suiikala
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 ml-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[11px] uppercase tracking-[0.2em] font-medium text-foreground/70 hover:text-emerald-brand transition-colors"
                activeProps={{ className: "text-emerald-brand" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xs ml-auto">
            <label className="sr-only" htmlFor="nav-search">
              Search products
            </label>
            <input
              id="nav-search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent border-b border-border py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-brand transition-colors"
            />
          </form>

          <div className="flex items-center gap-0.5 sm:gap-2 ml-auto md:ml-0 shrink-0">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="md:hidden p-2 text-foreground/70 hover:text-emerald-brand transition-colors"
            >
              <Search className="size-[18px]" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenu((v) => !v)}
                  className="hidden sm:flex items-center gap-2 p-2 text-foreground/70 hover:text-emerald-brand transition-colors"
                  aria-label="Account"
                >
                  <User className="size-[18px]" />
                </button>
                {menu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border shadow-lg py-2 z-50">
                    <p className="px-4 py-2 text-xs text-muted-foreground border-b border-border truncate">{user.email}</p>
                    <Link to="/account" onClick={() => setMenu(false)} className="block px-4 py-2 text-sm hover:bg-secondary text-forest-brand">
                      My Account
                    </Link>
                    <Link to="/account/orders" onClick={() => setMenu(false)} className="block px-4 py-2 text-sm hover:bg-secondary text-forest-brand">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenu(false)} className="px-4 py-2 text-sm hover:bg-secondary text-emerald-brand font-medium flex items-center gap-2 border-t border-border">
                        <ShieldCheck className="size-3.5" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setMenu(false);
                        await signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-secondary text-muted-foreground flex items-center gap-2"
                    >
                      <LogOut className="size-3" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                aria-label="Sign in"
                className="hidden sm:block p-2 text-foreground/70 hover:text-emerald-brand transition-colors"
              >
                <User className="size-[18px]" />
              </Link>
            )}

            <Link to="/account/wishlist" aria-label="Wishlist" className="relative p-2 text-foreground/70 hover:text-emerald-brand transition-colors">
              <Heart className="size-[18px]" />
              {wishlistCount > 0 && <Badge n={wishlistCount} />}
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative p-2 text-foreground/70 hover:text-emerald-brand transition-colors">
              <ShoppingBag className="size-[18px]" />
              {cartCount > 0 && <Badge n={cartCount} />}
            </Link>
          </div>
        </div>

        {/* Mobile inline search bar */}
        {searchOpen && (
          <form onSubmit={submitSearch} className="md:hidden border-t border-border bg-background px-4 py-3">
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search for gifts, jewellery…"
              aria-label="Search products"
              className="w-full bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-brand"
            />
          </form>
        )}
      </header>

      {/* Mobile drawer global overlay */}
      {open && (
        <div className="fixed inset-0 z-[9999] lg:hidden w-full h-full overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Drawer Wrapper */}
          <aside className="absolute left-0 top-0 h-full w-[85%] max-w-[360px] bg-[#064E3B] shadow-[0_0_60px_rgba(0,0,0,.45)] flex flex-col animate-slide-in">
            {/* Header section */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
              
              {/* 🌟 MOBILE: LOGO + BRAND NAME COMBINATION 🌟 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <img 
                    src="/log.jpeg" 
                    alt="Suiikala Logo" 
                    className="h-10 w-auto object-contain rounded-md" 
                  />
                  <h1 className="font-display italic text-3xl sm:text-4xl text-[#D4AF37] whitespace-nowrap leading-none">
                    Suiikala
                  </h1>
                </div>
                <p className="mt-0.5 text-[10px] tracking-[0.3em] uppercase text-white/60">
                  Handmade With Love
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 transition flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Body Container */}
            <div className="flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col justify-between">
              <div>
                {/* Search field */}
                <form onSubmit={submitSearch} className="mb-6">
                  <input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#D4AF37] transition"
                  />
                </form>

                {/* Main links */}
                <nav className="space-y-3.5">
                  {nav.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#064E3B]"
                    >
                      <span className="text-lg font-medium">{n.label}</span>
                      <span className="text-lg opacity-50 group-hover:opacity-100 transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom Section */}
              <div className="mt-8 border-t border-white/10 pt-6 space-y-3.5">
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="block text-sm text-white/80 hover:text-[#D4AF37] transition"
                >
                  Shopping Bag {cartCount > 0 && `(${cartCount})`}
                </Link>

                <Link
                  to="/account/wishlist"
                  onClick={() => setOpen(false)}
                  className="block text-sm text-white/80 hover:text-[#D4AF37] transition"
                >
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>

                {user ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setOpen(false)}
                      className="block text-sm text-white/80 hover:text-[#D4AF37] transition"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setOpen(false)}
                      className="block text-sm text-white/80 hover:text-[#D4AF37] transition"
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="block text-sm text-[#D4AF37] font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setOpen(false);
                        await signOut();
                      }}
                      className="block text-left text-sm text-white/60 hover:text-[#D4AF37] transition"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="block text-sm text-white/80 hover:text-[#D4AF37] transition"
                  >
                    Sign In
                  </Link>
                )}

                <a
                  href="https://wa.me/"
                  className="mt-4 block rounded-xl bg-[#D4AF37] px-5 py-3.5 text-center text-sm font-semibold text-[#064E3B] hover:opacity-95 transition shadow-sm"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-emerald-brand text-[9px] font-semibold text-cream grid place-items-center">
      {n}
    </span>
  );
}