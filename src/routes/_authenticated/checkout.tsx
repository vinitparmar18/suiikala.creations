import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/products";
import { fetchProductsBySlugs, PLACEHOLDER_IMG } from "@/lib/catalog";
import { placeOrder } from "@/lib/orders.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Suii Kala" },
      { name: "description", content: "Complete your Suii Kala order securely." },
      { property: "og:title", content: "Checkout — Suii Kala" },
      { property: "og:description", content: "Complete your Suii Kala order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

type Addr = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

const empty: Addr = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India" };

function Checkout() {
  const { cart, removeFromCart } = useStore();
  const nav = useNavigate();
  const slugs = cart.map((i) => i.slug);
  const { data: products = [] } = useQuery({
    queryKey: ["cart-products", slugs.slice().sort().join(",")],
    queryFn: () => fetchProductsBySlugs(slugs),
    enabled: slugs.length > 0,
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const [shipping, setShipping] = useState<Addr>(empty);
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<Addr>(empty);
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"cod" | "razorpay">("razorpay");
  const [coupon, setCoupon] = useState("");
  const [notes, setNotes] = useState("");

  // Animation & Success State
  const [successData, setSuccessData] = useState<{ order_id: string; order_number: string; total: number } | null>(null);

  const items = cart
    .map((i) => ({ item: i, product: bySlug.get(i.slug) }))
    .filter((x): x is { item: (typeof cart)[number]; product: NonNullable<ReturnType<typeof bySlug.get>> } => !!x.product);

  const subtotal = items.reduce((s, { item, product }) => s + product.price * item.qty, 0);
  const discount = coupon.trim().toUpperCase() === "SUII10" ? Math.round(subtotal * 0.1) : 0;
  const ship = subtotal >= 999 ? 0 : method === "express" ? 199 : 79;
  const tax = Math.round((subtotal - discount) * 0.03);
  const total = subtotal - discount + ship + tax;

  const place = useServerFn(placeOrder);
  const mut = useMutation({
    mutationFn: async () => {
      return await place({
        data: {
          items: items.map(({ item, product }) => ({
            product_slug: product.slug,
            name: product.name,
            price: product.price,
            qty: item.qty,
            image: product.image,
          })),
          shipping_address: shipping,
          billing_same: billingSame,
          billing_address: billingSame ? null : billing,
          shipping_method: method,
          coupon_code: coupon.trim() ? coupon.trim().toUpperCase() : null,
          payment_method: payment,
          notes: notes || null,
        },
      });
    },
    onSuccess: (r) => {
      items.forEach(({ product }) => removeFromCart(product.slug));
      setSuccessData(r); // Trigger success animation view
      toast.success(`Order ${r.order_number} placed successfully!`);
      
      // Redirect after 3 seconds so user enjoys the gorgeous animation
      setTimeout(() => {
        nav({ to: "/account/orders/$id", params: { id: r.order_id } });
      }, 3000);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to place order"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your bag is empty.");
    mut.mutate();
  };

  if (items.length === 0 && !successData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteNav />
        <div className="flex-1 grid place-items-center p-12 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand">Empty bag</p>
            <h1 className="font-display italic text-4xl text-forest-brand mt-3">Nothing to check out</h1>
            <Link to="/shop" className="mt-6 inline-block bg-forest-brand text-cream px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors">
              Browse the shop
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <SiteNav />

      {/* 🎉 AMAZING SUCCESS ANIMATION MODAL / SCREEN */}
      {successData && (
        <div className="fixed inset-0 z-50 bg-forest-brand/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-card border border-border max-w-md w-full p-8 text-center shadow-2xl relative transform animate-scaleUp rounded-xl">
            {/* Animated Checkmark Circle */}
            <div className="mx-auto w-20 h-20 bg-emerald-brand/10 border-2 border-emerald-brand rounded-full flex items-center justify-center mb-6 animate-bounce">
              <svg className="w-10 h-10 text-emerald-brand animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand font-semibold">Thank you for your order!</p>
            <h2 className="font-display italic text-3xl text-forest-brand mt-2">Order Confirmed</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your order <span className="font-mono font-bold text-forest-brand">#{successData.order_number}</span> has been successfully placed with love.
            </p>

            <div className="mt-6 bg-secondary/50 p-4 rounded-lg border border-border text-sm flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount Paid</span>
              <span className="font-mono text-lg font-semibold text-emerald-brand">{inr(successData.total)}</span>
            </div>

            <div className="mt-8">
              <Link
                to="/account/orders/$id"
                params={{ id: successData.order_id }}
                className="inline-block w-full bg-forest-brand text-cream py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors rounded"
              >
                View Order Details Now →
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 animate-pulse">Redirecting to your order summary automatically…</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="mx-auto max-w-7xl w-full px-6 lg:px-10 py-12 flex-1">
        <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-brand mb-3">Secure checkout</p>
        <h1 className="font-display italic text-4xl md:text-5xl text-forest-brand">Checkout</h1>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-10">
            <Section title="Shipping Address">
              <AddressForm value={shipping} onChange={setShipping} />
            </Section>

            <Section title="Billing Address">
              <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
                <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} />
                Same as shipping address
              </label>
              {!billingSame && <AddressForm value={billing} onChange={setBilling} />}
            </Section>

            <Section title="Shipping Method">
              <div className="grid sm:grid-cols-2 gap-3">
                <Option
                  active={method === "standard"}
                  onClick={() => setMethod("standard")}
                  title="Standard"
                  desc="5–7 business days"
                  price={subtotal >= 999 ? "Free" : inr(79)}
                />
                <Option
                  active={method === "express"}
                  onClick={() => setMethod("express")}
                  title="Express"
                  desc="2–3 business days"
                  price={inr(199)}
                />
              </div>
            </Section>

            <Section title="Payment Method">
              <div className="space-y-3">
                <PayOption
                  active={payment === "razorpay"}
                  onClick={() => setPayment("razorpay")}
                  title="UPI / Cards / Net Banking"
                  desc="GPay · PhonePe · Paytm · Visa · Mastercard · Rupay"
                />
                <PayOption
                  active={payment === "cod"}
                  onClick={() => setPayment("cod")}
                  title="Cash on Delivery"
                  desc="Pay in cash when your order arrives"
                />
              </div>
              {payment === "razorpay" && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Razorpay is in test mode — no real charge. Add live keys anytime to accept payments.
                </p>
              )}
            </Section>

            <Section title="Order Notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Gift wrapping preferences, special instructions…"
                className="w-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-emerald-brand rounded"
              />
            </Section>
          </div>

          <aside className="bg-secondary/50 p-8 h-fit lg:sticky lg:top-24 border border-border rounded-xl">
            <h2 className="font-display italic text-2xl text-forest-brand">Order Summary</h2>
            <div className="mt-6 space-y-3 max-h-64 overflow-auto">
              {items.map(({ item, product }) => (
                <div key={product.slug} className="flex gap-3 text-sm items-center">
                  <img src={product.image || PLACEHOLDER_IMG} alt={product.name} className="size-14 object-cover ring-1 ring-border rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-forest-brand font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.qty}</p>
                  </div>
                  <p className="font-mono text-emerald-brand">{inr(product.price * item.qty)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 border border-border px-3 py-2 text-sm bg-card rounded"
              />
              <span className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground border border-border flex items-center rounded">
                {discount > 0 ? "Applied" : "SUII10"}
              </span>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <Row label="Subtotal" value={inr(subtotal)} />
              {discount > 0 && <Row label="Discount" value={`− ${inr(discount)}`} accent />}
              <Row label={`Shipping${ship === 0 ? " (free)" : ""}`} value={ship === 0 ? "—" : inr(ship)} />
              <Row label="Tax (3% GST)" value={inr(tax)} />
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-forest-brand">Total</span>
              <span className="font-mono text-2xl text-emerald-brand font-semibold">{inr(total)}</span>
            </div>

            <button
              disabled={mut.isPending}
              className="mt-6 w-full bg-forest-brand text-cream py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors disabled:opacity-60 cursor-pointer rounded flex items-center justify-center gap-2"
            >
              {mut.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Placing order…
                </>
              ) : (
                `Place Order · ${inr(total)}`
              )}
            </button>
          </aside>
        </div>
      </form>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display italic text-2xl text-forest-brand mb-4">{title}</h2>
      {children}
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
function Option({ active, onClick, title, desc, price }: { active: boolean; onClick: () => void; title: string; desc: string; price: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 border transition-colors cursor-pointer rounded ${active ? "border-emerald-brand bg-secondary/50" : "border-border hover:border-forest-brand"}`}
    >
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-forest-brand">{title}</span>
        <span className="text-sm font-mono text-emerald-brand">{price}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </button>
  );
}
function PayOption({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 border transition-colors cursor-pointer rounded ${active ? "border-emerald-brand bg-secondary/50" : "border-border hover:border-forest-brand"}`}
    >
      <p className="text-sm font-medium text-forest-brand">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </button>
  );
}

function AddressForm({ value, onChange }: { value: Addr; onChange: (v: Addr) => void }) {
  const set = (k: keyof Addr) => (v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input label="Full name" value={value.name} onChange={set("name")} required />
      <Input label="Phone" value={value.phone} onChange={set("phone")} required />
      <Input label="Address line 1" value={value.line1} onChange={set("line1")} required full />
      <Input label="Address line 2" value={value.line2} onChange={set("line2")} full />
      <Input label="City" value={value.city} onChange={set("city")} required />
      <Input label="State" value={value.state} onChange={set("state")} required />
      <Input label="Pincode" value={value.pincode} onChange={set("pincode")} required />
      <Input label="Country" value={value.country} onChange={set("country")} required />
    </div>
  );
}
function Input({ label, value, onChange, required, full }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-emerald-brand rounded"
      />
    </label>
  );
}