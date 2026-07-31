import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CollectionGrid } from "@/components/collection-cards";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "All Collections — Suiikala" },
      {
        name: "description",
        content:
          "Browse every Suiikala collection — bracelets, anklets, neckpieces, earrings, albums, keychains, bouquets, gift hampers and more, handmade in Surat.",
      },
      { property: "og:title", content: "All Collections — Suii Kala" },
      { property: "og:description", content: "Every Suiikala collection, in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CollectionsIndex,
});

function CollectionsIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="gradient-emerald grain text-cream py-16 sm:py-20 px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold-brand mb-4">Curated</p>
          <h1 className="font-display italic text-4xl sm:text-5xl md:text-6xl">Our Collections</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-12 sm:py-16">
        <CollectionGrid />
      </section>

      <SiteFooter />
    </div>
  );
}
