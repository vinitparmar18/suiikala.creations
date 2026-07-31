import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Circle } from "lucide-react";
import { getMyOrder } from "@/lib/orders.functions";
import { inr } from "@/lib/products";
import { STATUS_ORDER, STATUS_LABELS } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/account/orders_/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getMyOrder);
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (error || !data) return <p className="text-destructive text-sm">Order not found.</p>;

  const { order, items, history } = data;
  const currentIdx = STATUS_ORDER.indexOf(order.status as (typeof STATUS_ORDER)[number]);
  const isCancelled = order.status === "cancelled" || order.status === "returned";
  const addr = order.shipping_address as {
    name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string; country: string;
  };

  return (
    <div>
      <Link to="/account/orders" className="text-xs text-emerald-brand hover:underline">← All orders</Link>
      <div className="mt-4 flex flex-wrap justify-between items-baseline gap-4">
        <div>
          <h2 className="font-display italic text-3xl text-forest-brand">Order {order.order_number}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Placed {new Date(order.created_at).toLocaleString("en-IN")}
          </p>
        </div>
        <span className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] ${isCancelled ? "bg-destructive/10 text-destructive" : "bg-emerald-brand/10 text-emerald-brand"}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {!isCancelled && (
        <div className="mt-8 border border-border p-6">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-forest-brand">Tracking</h3>
          <ol className="mt-4 grid grid-cols-1 sm:grid-cols-7 gap-2">
            {STATUS_ORDER.map((s, i) => {
              const done = i <= currentIdx;
              return (
                <li key={s} className="flex sm:flex-col items-center gap-2">
                  <div className={`size-8 rounded-full grid place-items-center border ${done ? "bg-emerald-brand text-cream border-emerald-brand" : "border-border text-muted-foreground"}`}>
                    {done ? <Check className="size-4" /> : <Circle className="size-3" />}
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.15em] ${done ? "text-forest-brand" : "text-muted-foreground"}`}>
                    {STATUS_LABELS[s]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-forest-brand">Items</h3>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {items.map((it) => (
              <li key={it.id} className="py-4 flex gap-4">
                {it.image && <img src={it.image} alt={it.name} className="size-16 object-cover ring-1 ring-border" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-forest-brand truncate">{it.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {it.qty} · {inr(it.price)}</p>
                </div>
                <p className="font-mono text-sm text-emerald-brand">{inr(it.price * it.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <Row label="Subtotal" v={inr(order.subtotal)} />
            {order.discount > 0 && <Row label="Discount" v={`− ${inr(order.discount)}`} />}
            <Row label="Shipping" v={order.shipping === 0 ? "Free" : inr(order.shipping)} />
            <Row label="Tax" v={inr(order.tax)} />
            <div className="flex justify-between pt-2 border-t border-border mt-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-forest-brand">Total</span>
              <span className="font-mono text-lg text-emerald-brand">{inr(order.total)}</span>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-forest-brand">Shipping to</h3>
            <div className="mt-3 text-sm text-foreground/80">
              <p className="font-medium">{addr.name}</p>
              <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
              <p>{addr.city}, {addr.state} {addr.pincode}</p>
              <p>{addr.country} · {addr.phone}</p>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-forest-brand">Payment</h3>
            <p className="mt-3 text-sm capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"} — {order.payment_status}</p>
          </div>
          {history.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-forest-brand">History</h3>
              <ul className="mt-3 space-y-2 text-xs">
                {history.map((h) => (
                  <li key={h.id} className="flex justify-between border-b border-border/60 py-2">
                    <span className="text-forest-brand">{STATUS_LABELS[h.status] ?? h.status}</span>
                    <span className="text-muted-foreground">{new Date(h.created_at).toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function Row({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-forest-brand">{v}</span>
    </div>
  );
}
