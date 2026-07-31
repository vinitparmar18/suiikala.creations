import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteReview, listReviews, setReviewApproval } from "@/lib/admin.functions";
import { Star, Trash2, Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reviews")({ component: ReviewsPage });

function ReviewsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-reviews"], queryFn: () => listReviews() });
  const approve = useMutation({
    mutationFn: (v: { id: string; approved: boolean }) => setReviewApproval({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-reviews"] }); },
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteReview({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand">Feedback</p>
        <h1 className="font-display italic text-4xl mt-2">Reviews</h1>
      </header>
      <div className="space-y-3">
        {data.map((r: any) => (
          <div key={r.id} className="rounded-2xl bg-black/30 border border-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-4 ${i < r.rating ? "fill-gold-brand text-gold-brand" : "text-white/20"}`} />)}</div>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${r.approved ? "bg-emerald-brand/30 text-emerald-100" : "bg-white/10 text-cream/60"}`}>
                    {r.approved ? "Approved" : "Pending"}
                  </span>
                </div>
                {r.title && <p className="font-medium mt-2">{r.title}</p>}
                <p className="text-sm text-cream/70 mt-1">{r.body}</p>
                <p className="text-xs text-cream/40 mt-2 font-mono">{r.product_slug} · {new Date(r.created_at).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => approve.mutate({ id: r.id, approved: !r.approved })} className="p-2 text-cream/70 hover:text-gold-brand" title={r.approved ? "Unapprove" : "Approve"}>
                  {r.approved ? <XIcon className="size-4" /> : <Check className="size-4" />}
                </button>
                <button onClick={() => confirm("Delete review?") && del.mutate(r.id)} className="p-2 text-cream/70 hover:text-red-400"><Trash2 className="size-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-cream/50">No reviews yet.</p>}
      </div>
    </div>
  );
}
