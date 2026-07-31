import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/admin.functions";
import { IndianRupee, Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { STATUS_LABELS } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

const inr = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => getDashboardStats() });
  if (isLoading || !data) return <div className="text-cream/70">Loading dashboard…</div>;
  const maxRev = Math.max(1, ...data.last7.map(d => d.revenue));
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Overview</p>
        <h1 className="font-display italic text-4xl mt-2">Dashboard</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue (Paid)" value={inr(data.revenue)} icon={IndianRupee} />
        <Stat label="Total Orders" value={data.ordersCount} icon={ShoppingBag} />
        <Stat label="Products" value={data.productsCount} icon={Package} />
        <Stat label="Customers" value={data.customersCount} icon={Users} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display italic text-2xl">Last 7 Days</h2>
            <TrendingUp className="size-5 text-gold-brand" />
          </div>
          <div className="flex items-end gap-3 h-48">
            {data.last7.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gold-brand/70 rounded-t transition-all" style={{ height: `${(d.revenue / maxRev) * 100}%`, minHeight: "4px" }} title={inr(d.revenue)} />
                <span className="text-[10px] text-cream/60">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
          <h2 className="font-display italic text-2xl mb-4">Fulfillment</h2>
          <div className="space-y-3 text-sm">
            <Row label="Pending" value={data.pending} />
            <Row label="Shipped" value={data.shipped} />
            <Row label="Delivered" value={data.delivered} />
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
        <h2 className="font-display italic text-2xl mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-cream/50">
            <tr><th className="text-left py-2">Order</th><th className="text-left">Status</th><th className="text-left">Payment</th><th className="text-right">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.recent.map((o: any) => (
              <tr key={o.id}>
                <td className="py-3 font-mono text-xs">{o.order_number}</td>
                <td>{STATUS_LABELS[o.status] ?? o.status}</td>
                <td className="capitalize">{o.payment_status}</td>
                <td className="text-right font-medium text-gold-brand">{inr(o.total)}</td>
              </tr>
            ))}
            {data.recent.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-cream/50">No orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: any; icon: any }) {
  return (
    <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cream/60">{label}</p>
        <Icon className="size-4 text-gold-brand" />
      </div>
      <p className="font-display italic text-3xl mt-3 text-cream">{value}</p>
    </div>
  );
}
function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between"><span className="text-cream/70">{label}</span><span className="font-medium text-gold-brand">{value}</span></div>;
}
