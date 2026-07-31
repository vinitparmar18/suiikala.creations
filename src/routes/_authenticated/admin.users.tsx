import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listCustomers, setUserRole } from "@/lib/admin.functions";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: AdminUsersPage });

function AdminUsersPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-customers"], queryFn: () => listCustomers() });
  const admins = data.filter((c: any) => c.roles.includes("admin"));
  const others = data.filter((c: any) => !c.roles.includes("admin"));
  const toggle = useMutation({
    mutationFn: (v: { user_id: string; grant: boolean }) => setUserRole({ data: { user_id: v.user_id, role: "admin", grant: v.grant } }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-customers"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Access</p>
        <h1 className="font-display italic text-4xl mt-2">Admin Users & Permissions</h1>
      </header>
      <section>
        <h2 className="font-display italic text-2xl mb-4 flex items-center gap-2"><ShieldCheck className="size-5 text-gold-brand" /> Current Admins</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {admins.map((c: any) => (
            <div key={c.id} className="rounded-2xl bg-black/30 border border-gold-brand/30 p-5 backdrop-blur-xl flex items-center justify-between">
              <div>
                <p className="font-medium">{c.full_name ?? "Unnamed"}</p>
                <p className="text-xs text-cream/50 font-mono">{c.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => toggle.mutate({ user_id: c.id, grant: false })} className="text-xs text-red-300 hover:text-red-400">Revoke</button>
            </div>
          ))}
          {admins.length === 0 && <p className="text-cream/50">No admins.</p>}
        </div>
      </section>
      <section>
        <h2 className="font-display italic text-2xl mb-4">Promote to Admin</h2>
        <div className="rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-cream/50 bg-black/20">
              <tr><th className="text-left p-4">Name</th><th className="text-left">Phone</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {others.map((c: any) => (
                <tr key={c.id}>
                  <td className="p-4">{c.full_name ?? "—"}</td>
                  <td className="text-cream/70">{c.phone ?? "—"}</td>
                  <td className="text-right p-4"><button onClick={() => toggle.mutate({ user_id: c.id, grant: true })} className="text-xs text-gold-brand hover:underline">Make Admin</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
