import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminListOrders } from "@/lib/admin.functions";
import { STATUS_LABELS } from "@/lib/order-status";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/orders/")({ component: OrdersPage });

function OrdersPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => adminListOrders() });
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? data : data.filter((o: any) => o.status === filter);
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Fulfillment</p>
        <h1 className="font-display italic text-4xl mt-2">Orders</h1>
      </header>
      <div className="flex flex-wrap gap-2">
        {["all", "order_placed", "payment_confirmed", "preparing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest ${filter === s ? "bg-gold-brand text-forest-brand" : "bg-white/10 text-cream/70 hover:bg-white/20"}`}>
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl overflow-hidden">
        {isLoading ? <p className="p-6 text-cream/60">Loading…</p> : (
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-cream/50 bg-black/20">
              <tr><th className="text-left p-4">Order</th><th className="text-left">Customer</th><th className="text-left">Status</th><th className="text-left">Payment</th><th className="text-right">Total</th><th className="text-right pr-4">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((o: any) => (
                <tr key={o.id} className="hover:bg-white/5">
                  <td className="p-4"><Link to="/admin/orders/$id" params={{ id: o.id }} className="font-mono text-xs text-gold-brand hover:underline">{o.order_number}</Link></td>
                  <td className="text-cream/70">{(o.shipping_address as any)?.name ?? "—"}</td>
                  <td>{STATUS_LABELS[o.status] ?? o.status}</td>
                  <td className="capitalize">{o.payment_status} · <span className="text-cream/50">{o.payment_method}</span></td>
                  <td className="text-right font-medium text-gold-brand">₹{o.total.toLocaleString("en-IN")}</td>
                  <td className="text-right pr-4 text-cream/60 text-xs">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-cream/50">No orders</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}