import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminGetOrder, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/order-status";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({ component: OrderDetail });

function OrderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-order", id], queryFn: () => adminGetOrder({ data: { id } }) });
  const [note, setNote] = useState("");
  const update = useMutation({
    mutationFn: (v: { status: string; payment_status?: string }) => adminUpdateOrderStatus({ data: { id, note, ...v } }),
    onSuccess: () => { toast.success("Status updated"); setNote(""); qc.invalidateQueries({ queryKey: ["admin-order", id] }); qc.invalidateQueries({ queryKey: ["admin-orders"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading || !data) return <p className="text-cream/60">Loading…</p>;
  const { order, items, history, customer } = data;
  const addr = order.shipping_address as any;


  return (
    <div className="space-y-6">
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cream/60 hover:text-gold-brand"><ArrowLeft className="size-3" /> Back to orders</Link>
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Order</p>
          <h1 className="font-display italic text-4xl mt-2 font-mono">{order.order_number}</h1>
          <p className="text-sm text-cream/60 mt-1">{new Date(order.created_at).toLocaleString("en-IN")}</p>
        </div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-white/20"><Printer className="size-4" /> Invoice</button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
            <h2 className="font-display italic text-2xl mb-4">Items</h2>
            <div className="space-y-3">
              {items.map((it: any) => (
                <div key={it.id} className="flex items-center gap-4 border-b border-white/5 pb-3">
                  {it.image && <img src={it.image} alt="" className="size-14 rounded object-cover" />}
                  <div className="flex-1">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-xs text-cream/50">Qty {it.qty} × ₹{it.price.toLocaleString("en-IN")}</p>
                  </div>
                  <p className="text-gold-brand font-medium">₹{(it.qty * it.price).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-1 text-sm">
              <Row l="Subtotal" v={order.subtotal} />
              {order.discount > 0 && <Row l={`Discount (${order.coupon_code ?? ""})`} v={-order.discount} />}
              <Row l="Shipping" v={order.shipping} />
              <Row l="Tax" v={order.tax} />
              <div className="border-t border-white/10 mt-2 pt-2"><Row l="Total" v={order.total} bold /></div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
            <h2 className="font-display italic text-2xl mb-4">Status Timeline</h2>
            <div className="space-y-3">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-start gap-3">
                  <div className="size-2 rounded-full bg-gold-brand mt-2" />
                  <div>
                    <p className="text-sm font-medium">{STATUS_LABELS[h.status] ?? h.status}</p>
                    {h.note && <p className="text-xs text-cream/60">{h.note}</p>}
                    <p className="text-[10px] text-cream/40">{new Date(h.created_at).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
            <h3 className="text-[10px] uppercase tracking-widest text-cream/60 mb-2">Customer</h3>
            <p className="text-sm font-medium">{customer?.name ?? addr?.name ?? "Guest"}</p>
            {customer?.email && (
              <a href={`mailto:${customer.email}`} className="block text-sm text-cream/70 hover:text-gold-brand break-all">
                ✉ {customer.email}
              </a>
            )}
            {(customer?.phone || addr?.phone) && (
              <a href={`tel:${customer?.phone ?? addr?.phone}`} className="block text-sm text-cream/70 hover:text-gold-brand">
                📞 {customer?.phone ?? addr?.phone}
              </a>
            )}
            <p className="mt-2 text-[10px] uppercase tracking-widest text-cream/40">
              Payment · {order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"} — {order.payment_status}
            </p>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
            <h3 className="text-[10px] uppercase tracking-widest text-cream/60 mb-2">Shipping Address</h3>
            <p className="text-sm font-medium">{addr?.name}</p>
            <p className="text-sm text-cream/70">{addr?.line1}{addr?.line2 ? `, ${addr.line2}` : ""}</p>
            <p className="text-sm text-cream/70">{addr?.city}, {addr?.state} {addr?.pincode}</p>
            <p className="text-sm text-cream/70">{addr?.country}</p>
            <p className="text-sm text-cream/70 mt-2">📞 {addr?.phone}</p>
          </div>


          <div className="rounded-2xl bg-black/30 border border-white/10 p-6 backdrop-blur-xl">
            <h3 className="text-[10px] uppercase tracking-widest text-cream/60 mb-3">Update Status</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {STATUS_ORDER.map((s) => (
                <button key={s} onClick={() => update.mutate({ status: s })} className="px-3 py-2 rounded bg-white/10 hover:bg-gold-brand hover:text-forest-brand text-xs">{STATUS_LABELS[s]}</button>
              ))}
              <button onClick={() => update.mutate({ status: "cancelled" })} className="px-3 py-2 rounded bg-red-500/20 hover:bg-red-500/40 text-xs">Cancel</button>
              <button onClick={() => update.mutate({ status: "returned", payment_status: "refunded" })} className="px-3 py-2 rounded bg-red-500/20 hover:bg-red-500/40 text-xs">Return & Refund</button>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-cream/60">Payment</p>
              <div className="flex gap-2">
                <button onClick={() => update.mutate({ status: order.status, payment_status: "paid" })} className="flex-1 px-3 py-2 rounded bg-emerald-brand/40 hover:bg-emerald-brand/60 text-xs">Mark Paid</button>
                <button onClick={() => update.mutate({ status: order.status, payment_status: "refunded" })} className="flex-1 px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-xs">Mark Refunded</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ l, v, bold }: { l: string; v: number; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-semibold text-gold-brand" : "text-cream/70"}`}><span>{l}</span><span>₹{v.toLocaleString("en-IN")}</span></div>;
}