import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyOrders } from "@/lib/orders.functions";
import { inr } from "@/lib/products";
import { STATUS_LABELS } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/account/orders")({
  component: Orders,
});

function Orders() {
  const fetchOrders = useServerFn(listMyOrders);
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => fetchOrders(),
  });

  return (
    <div>
      <h2 className="font-display italic text-3xl text-forest-brand">My Orders</h2>
      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="mt-8 py-16 border border-dashed border-border text-center">
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-forest-brand text-cream px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-emerald-brand transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {data.map((o) => (
            <li key={o.id}>
              <Link
                to="/account/orders/$id"
                params={{ id: o.id }}
                className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-5 items-center hover:bg-secondary/30 px-2 -mx-2 transition-colors"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Order</p>
                  <p className="font-mono text-sm text-forest-brand">{o.order_number}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Date</p>
                  <p className="text-sm">{new Date(o.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                  <p className="font-mono text-sm text-emerald-brand">{inr(o.total)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Payment</p>
                  <p className="text-xs capitalize">{o.payment_method === "cod" ? "COD" : "Razorpay"} · {o.payment_status}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-brand/10 text-emerald-brand px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}