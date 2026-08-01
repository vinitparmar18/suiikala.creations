import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/products";
import { fetchProductsBySlugs, PLACEHOLDER_IMG } from "@/lib/catalog";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Suiikala" },
      { name: "description", content: "Review your SuiiKala selection before checkout." },
      { property: "og:title", content: "Your Bag — Suiikala" },
      { property: "og:description", content: "Review your Suiikala selection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cart,
});

interface Coupon {
  code: string;
  discount_percent: number;
  min_order: number;
  is_active: boolean;
}

function Cart() {
  const { cart, setQty, removeFromCart } = useStore();
  const slugs = cart.map((i) => i.slug);
  const { data: products = [] } = useQuery({
    queryKey: ["cart-products", slugs.slice().sort().join(",")],
    queryFn: () => fetchProductsBySlugs(slugs),
    enabled: slugs.length > 0,
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  const items = cart
    .map((i) => ({ item: i, product: bySlug.get(i.slug) }))
    .filter((x): x is { item: (typeof cart)[number]; product: NonNullable<ReturnType<typeof bySlug.get>> } => !!x.product);

  const subtotal = items.reduce((s, { item, product }) => s + product.price * item.qty, 0);
  
  // Dynamic discount calculation based on database coupon
  const discount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discount_percent) / 100) : 0;
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponInput.trim()) return;

    const formattedCode = couponInput.trim();

    // Fetch coupon from Supabase database dynamically
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", formattedCode)
      .single();

    if (error || !data) {
      setCouponError("Invalid coupon code.");
      setAppliedCoupon(null);
      return;
    }

    if (subtotal < (data.min_order || 0)) {
      setCouponError(`Minimum order of ${inr(data.min_order)} required.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(data);
    setCouponError("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-0">
      <SiteNav />

      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-10 py-8 md:py-12 flex-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-2">Your selection</p>
        <h1 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-forest-brand">The Velvet Bag</h1>

        {items.length === 0 ? (
          <div className="mt-16 sm:mt-20 text-center py-12 sm:py-16 border border-dashed border-border rounded-2xl p-6">
            <p className="text-muted-foreground text-sm">Your bag is empty.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 bg-forest-brand text-cream px-6 sm:px-8 py-3.5 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors rounded-full"
            >
              Start shopping <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
            <div className="divide-y divide-border border-y border-border">
              {items.map(({ item, product }) => (
                <div key={product.slug} className="py-5 sm:py-6 flex gap-4 sm:gap-6 items-start">
                  <Link
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    className="w-20 sm:w-32 aspect-square shrink-0 overflow-hidden ring-1 ring-border rounded-xl bg-muted"
                  >
                    <img src={product.image || PLACEHOLDER_IMG} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
                      <h3 className="font-display italic text-lg sm:text-xl text-forest-brand truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.material}</p>
                      
                      <div className="mt-3 inline-flex items-center border border-border rounded-full bg-secondary/30">
                        <button onClick={() => setQty(product.slug, item.qty - 1)} className="p-2 hover:text-emerald-brand" aria-label="Decrease">
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-xs sm:text-sm font-semibold">{item.qty}</span>
                        <button onClick={() => setQty(product.slug, item.qty + 1)} className="p-2 hover:text-emerald-brand" aria-label="Increase">
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-between items-end sm:text-right shrink-0 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <p className="font-mono text-base sm:text-lg text-emerald-brand font-semibold">{inr(product.price * item.qty)}</p>
                      <button
                        onClick={() => removeFromCart(product.slug)}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="size-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-secondary/50 p-6 sm:p-8 h-fit sticky top-24 border border-border rounded-2xl shadow-sm">
              <h2 className="font-display italic text-2xl text-forest-brand">Order Summary</h2>

              {/* Database-connected Coupon Section */}
              <div className="mt-6 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 border border-border px-3 bg-card rounded-xl h-11 shrink min-w-0">
                  <Tag className="size-4 text-gold-brand shrink-0" />
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full text-xs bg-transparent outline-none truncate uppercase"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 h-11 border border-forest-brand text-[10px] uppercase tracking-[0.1em] text-forest-brand hover:bg-forest-brand hover:text-cream transition-colors rounded-xl font-semibold shrink-0"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <p className="mt-2 text-xs text-emerald-brand font-medium">
                  Code {appliedCoupon.code} applied — {appliedCoupon.discount_percent}% off!
                </p>
              )}
              {couponError && <p className="mt-2 text-xs text-destructive font-medium">{couponError}</p>}
              {!appliedCoupon && !couponError && (
                <p className="mt-2 text-xs text-muted-foreground">Try typing active codes like <b>SUII11</b>.</p>
              )}

              <div className="mt-6 space-y-3 text-xs sm:text-sm">
                <Row label="Subtotal" value={inr(subtotal)} />
                {discount > 0 && <Row label="Discount" value={`− ${inr(discount)}`} accent />}
                <Row label={`Shipping${shipping === 0 ? " (free)" : ""}`} value={shipping === 0 ? "—" : inr(shipping)} />
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-forest-brand font-semibold">Total</span>
                <span className="font-mono text-xl sm:text-2xl text-emerald-brand font-semibold">{inr(total)}</span>
              </div>

              <Link
                to="/checkout"
                className="mt-6 w-full block text-center bg-forest-brand text-cream py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors rounded-full shadow-luxe"
              >
                Proceed to Checkout
              </Link>
              <p className="mt-3 text-[9px] sm:text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                UPI · Cards · Net Banking · COD
              </p>
            </aside>
          </div>
        )}
      </section>

      {/* Mobile Sticky Bottom Checkout Action Bar */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 sm:p-4 flex items-center justify-between gap-4 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Total Amount</span>
            <span className="font-mono text-lg font-semibold text-emerald-brand">{inr(total)}</span>
          </div>
          <Link
            to="/checkout"
            className="flex-1 max-w-[200px] bg-forest-brand text-cream py-3 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold hover:bg-emerald-brand text-center shadow-md flex items-center justify-center gap-1.5"
          >
            Checkout <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "text-emerald-brand font-semibold" : "text-forest-brand font-medium"}>{value}</span>
    </div>
  );
}