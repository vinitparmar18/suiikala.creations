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
      <section className="gradient-emerald grain text-cream py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link to="/collections" className="text-[10px] uppercase tracking-[0.3em] text-gold-brand hover:text-cream">
            ← All collections
          </Link>
          <h1 className="mt-4 font-display italic text-5xl md:text-6xl">{collection.name}</h1>
          <p className="mt-3 text-cream/70 text-lg">{collection.tagline}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        {isLoading ? (
          <p className="text-center py-24 text-muted-foreground">Loading pieces…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">New pieces in this collection are being finished.</p>
            <Link to="/shop" className="mt-6 inline-block text-emerald-brand text-[11px] uppercase tracking-[0.2em] font-semibold">
              Shop all →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
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
