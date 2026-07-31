import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { searchProducts } from "@/lib/catalog";

type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search — Suiikala" },
      { name: "description", content: "Search handmade gifts, jewellery and personalized creations at Suii Kala." },
      { property: "og:title", content: "Search — Suiikala" },
      { property: "og:description", content: "Find your perfect Suiikala piece." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const term = useMemo(() => (search.q ?? "").trim(), [search.q]);

  useEffect(() => setQ(search.q ?? ""), [search.q]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", term],
    queryFn: () => searchProducts(term),
    enabled: term.length > 0,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { q: q.trim() || undefined } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />
      <section className="gradient-emerald grain text-cream py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand mb-4">Find your piece</p>
          <h1 className="font-display italic text-5xl md:text-6xl">Search</h1>
          <form onSubmit={submit} className="mt-10 flex items-center gap-3 border-b border-cream/30 pb-3">
            <SearchIcon className="size-5 text-gold-brand" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try 'rakhi', 'jhumkas', 'hamper'…"
              className="flex-1 bg-transparent outline-none text-cream placeholder:text-cream/50 text-lg tracking-wide"
            />
            <button className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gold-brand">Search</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl w-full px-6 lg:px-10 py-16 flex-1">
        {!term ? (
          <p className="text-center text-muted-foreground py-16">Start typing to find pieces.</p>
        ) : isFetching ? (
          <p className="text-center text-muted-foreground py-16">Searching…</p>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No pieces match "{term}".</p>
            <Link to="/shop" className="mt-6 inline-block text-emerald-brand text-[11px] uppercase tracking-[0.2em] font-semibold">
              Browse all →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-8">
              {results.length} result{results.length === 1 ? "" : "s"} for "{term}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
