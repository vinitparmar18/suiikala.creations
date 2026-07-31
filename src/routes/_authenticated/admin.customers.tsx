import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listCustomers, setUserRole } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/customers")({ component: CustomersPage });

function CustomersPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: () => listCustomers() });
  const toggle = useMutation({
    mutationFn: (v: { user_id: string; grant: boolean }) => setUserRole({ data: { user_id: v.user_id, role: "admin", grant: v.grant } }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-customers"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">People</p>
        <h1 className="font-display italic text-4xl mt-2">Customers</h1>
      </header>
      <div className="rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl overflow-hidden">
        {isLoading ? <p className="p-6 text-cream/60">Loading…</p> : (
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-cream/50 bg-black/20">
              <tr><th className="text-left p-4">Name</th><th className="text-left">Phone</th><th className="text-right">Orders</th><th className="text-right">Spent</th><th className="text-center">Role</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((c: any) => {
                const isAdmin = c.roles.includes("admin");
                return (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="p-4">{c.full_name ?? "—"}<p className="text-[10px] text-cream/40 font-mono">{c.id.slice(0, 8)}</p></td>
                    <td className="text-cream/70">{c.phone ?? "—"}</td>
                    <td className="text-right">{c.orders}</td>
                    <td className="text-right text-gold-brand font-medium">₹{c.spent.toLocaleString("en-IN")}</td>
                    <td className="text-center">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${isAdmin ? "bg-gold-brand/30 text-gold-brand" : "bg-white/10 text-cream/60"}`}>
                        {isAdmin ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td className="text-right p-4">
                      <button onClick={() => toggle.mutate({ user_id: c.id, grant: !isAdmin })} className="text-xs text-cream/70 hover:text-gold-brand">
                        {isAdmin ? "Revoke Admin" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-cream/50">No customers yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
