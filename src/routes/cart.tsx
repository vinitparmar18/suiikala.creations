import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/products";
import { fetchProductsBySlugs, PLACEHOLDER_IMG } from "@/lib/catalog";

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

function Cart() {
  const { cart, setQty, removeFromCart } = useStore();
  const slugs = cart.map((i) => i.slug);
  const { data: products = [] } = useQuery({
    queryKey: ["cart-products", slugs.slice().sort().join(",")],
    queryFn: () => fetchProductsBySlugs(slugs),
    enabled: slugs.length > 0,
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<string | null>(null);

  const items = cart
    .map((i) => ({ item: i, product: bySlug.get(i.slug) }))
    .filter((x): x is { item: (typeof cart)[number]; product: NonNullable<ReturnType<typeof bySlug.get>> } => !!x.product);

  const subtotal = items.reduce((s, { item, product }) => s + product.price * item.qty, 0);
  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal - discount + shipping;

  const apply = () => {
    if (coupon.toUpperCase() === "SUII10") setApplied("SUII10");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />

      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 py-12 flex-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-3">Your selection</p>
        <h1 className="font-display italic text-4xl md:text-5xl text-forest-brand">The Velvet Bag</h1>

        {items.length === 0 ? (
          <div className="mt-20 text-center py-16 border border-dashed border-border">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 bg-forest-brand text-cream px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors"
            >
              Start shopping <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            <div className="divide-y divide-border border-y border-border">
              {items.map(({ item, product }) => (
                <div key={product.slug} className="py-6 flex gap-4 sm:gap-6">
                  <Link
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    className="w-24 sm:w-32 aspect-square shrink-0 overflow-hidden ring-1 ring-border"
                  >
                    <img src={product.image || PLACEHOLDER_IMG} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
                      <h3 className="font-display italic text-xl text-forest-brand truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{product.material}</p>
                      <div className="mt-4 inline-flex items-center border border-border rounded-full">
                        <button onClick={() => setQty(product.slug, item.qty - 1)} className="p-2 hover:text-emerald-brand" aria-label="Decrease">
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button onClick={() => setQty(product.slug, item.qty + 1)} className="p-2 hover:text-emerald-brand" aria-label="Increase">
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col justify-between">
                      <p className="font-mono text-lg text-emerald-brand font-semibold">{inr(product.price * item.qty)}</p>
                      <button
                        onClick={() => removeFromCart(product.slug)}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive self-end sm:self-auto"
                      >
                        <X className="size-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-secondary/50 p-8 h-fit sticky top-24 border border-border">
              <h2 className="font-display italic text-2xl text-forest-brand">Order Summary</h2>

              <div className="mt-6 flex gap-2">
                <div className="flex-1 flex items-center gap-2 border border-border px-3 bg-card">
                  <Tag className="size-4 text-gold-brand" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 py-2 text-sm bg-transparent outline-none"
                  />
                </div>
                <button
                  onClick={apply}
                  className="px-4 border border-forest-brand text-[10px] uppercase tracking-[0.2em] text-forest-brand hover:bg-forest-brand hover:text-cream transition-colors"
                >
                  Apply
                </button>
              </div>
              {applied && <p className="mt-2 text-xs text-emerald-brand">Code {applied} applied — 10% off.</p>}
              {!applied && <p className="mt-2 text-xs text-muted-foreground">Try SUII10 for 10% off.</p>}

              <div className="mt-6 space-y-3 text-sm">
                <Row label="Subtotal" value={inr(subtotal)} />
                {discount > 0 && <Row label="Discount" value={`− ${inr(discount)}`} accent />}
                <Row label={`Shipping${shipping === 0 ? " (free)" : ""}`} value={shipping === 0 ? "—" : inr(shipping)} />
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-forest-brand">Total</span>
                <span className="font-mono text-2xl text-emerald-brand font-semibold">{inr(total)}</span>
              </div>

              <Link
                to="/checkout"
                className="mt-6 w-full block text-center bg-forest-brand text-cream py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors"
              >
                Proceed to Checkout
              </Link>
              <p className="mt-3 text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                UPI · Cards · Net Banking · COD
              </p>
            </aside>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "text-emerald-brand" : "text-forest-brand"}>{value}</span>
    </div>
  );
}
