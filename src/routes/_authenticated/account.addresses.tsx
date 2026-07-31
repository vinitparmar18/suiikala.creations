import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type Address = {
  id: string;
  label: string | null;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
};

export const Route = createFileRoute("/_authenticated/account/addresses")({
  component: Addresses,
});

function Addresses() {
  const { user } = useAuth();
  const [list, setList] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").order("created_at", { ascending: false });
    setList((data as Address[]) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("addresses").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Address added.");
    setShowForm(false);
    setForm({ label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", country: "India" });
    load();
  };
  const del = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <h2 className="font-display italic text-3xl text-forest-brand">Saved Addresses</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 border border-forest-brand text-forest-brand px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-forest-brand hover:text-cream transition-colors"
        >
          <Plus className="size-3" /> {showForm ? "Cancel" : "New address"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={add} className="mt-6 border border-border p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["label","name","phone","line1","line2","city","state","pincode","country"] as const).map((k) => (
            <label key={k} className={k === "line1" || k === "line2" ? "sm:col-span-2" : ""}>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</span>
              <input
                value={(form as Record<string, string>)[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                required={k !== "line2" && k !== "label"}
                className="mt-1 w-full border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:border-emerald-brand"
              />
            </label>
          ))}
          <div className="sm:col-span-2">
            <button className="bg-forest-brand text-cream px-6 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-brand transition-colors">
              Save address
            </button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <p className="mt-8 py-16 border border-dashed border-border text-center text-muted-foreground">No addresses saved.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((a) => (
            <li key={a.id} className="border border-border p-5 relative">
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-brand">{a.label ?? "Address"}</p>
              <p className="mt-2 font-medium text-forest-brand">{a.name}</p>
              <p className="text-sm text-foreground/80">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
              <p className="text-sm text-foreground/80">{a.city}, {a.state} {a.pincode}</p>
              <p className="text-sm text-muted-foreground">{a.country} · {a.phone}</p>
              <button onClick={() => del(a.id)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive" aria-label="Delete">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
