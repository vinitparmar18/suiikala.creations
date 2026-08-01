import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { findCollection } from "@/lib/collections";
import { fetchProductsByCollection } from "@/lib/catalog";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const collection = findCollection(params.slug);
    const title = collection ? `${collection.name} — Suiikala` : "Collection — Suiikala";
    return {
      meta: [
        { title },
        { name: "description", content: collection ? `${collection.name}: ${collection.tagline}. Handmade at Suiikala's Surat studio.` : "Suiikala collection." },
        { property: "og:title", content: title },
        { property: "og:description", content: collection?.tagline ?? "Suiikala collection." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionDetail,
});

function CollectionDetail() {
  const { slug } = Route.useParams();
  const collection = findCollection(slug) ?? { slug, name: slug, tagline: "Handmade collection" };
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["collection", slug],
    queryFn: () => fetchProductsByCollection(slug),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <section className="gradient-emerald grain text-cream py-24 px-6 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-forest-brand/90 via-forest-brand/60 to-transparent pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <Link to="/shop" className="text-[10px] uppercase tracking-[0.3em] text-gold-brand hover:text-cream transition-colors">
            ← Back to Shop All
          </Link>
          <h1 className="mt-4 font-display italic text-5xl md:text-6xl text-cream">{collection.name}</h1>
          <p className="mt-3 text-cream/80 text-base max-w-lg">{collection.tagline}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="size-8 rounded-full border-2 border-gold-brand border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading pieces…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="font-display italic text-2xl text-forest-brand">New pieces in this collection are being finished.</p>
            <div>
              <Link to="/shop" className="mt-4 inline-block px-6 py-3 bg-forest-brand text-gold-brand text-[10px] uppercase tracking-[0.2em] font-semibold rounded-full hover:bg-emerald-brand hover:text-cream transition-colors">
                Shop all products →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 animate-fade-up">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}