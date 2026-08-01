import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { collections, type Collection } from "@/lib/collections";
import { fetchCollectionCounts } from "@/lib/catalog";

export function CollectionCard({
  collection,
  index = 0,
  count,
}: {
  collection: Collection;
  index?: number;
  count?: number;
}) {
  return (
    <Link
      to="/collections/$slug"
      params={{ slug: collection.slug }}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary/40 border border-border/70 shadow-sm transition-all duration-500 hover:border-emerald-brand/50 hover:shadow-xl hover:-translate-y-1 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <img
        src={collection.image}
        alt={collection.name}
        loading="lazy"
        width={900}
        height={1200}
        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-brand/90 via-forest-brand/25 to-transparent transition-opacity duration-500 group-hover:from-forest-brand/95" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10">
        <p className="font-display text-lg sm:text-2xl text-cream leading-tight">{collection.name}</p>
        <p className="mt-0.5 text-[10px] sm:text-[11px] text-cream/70">{collection.tagline}</p>
        {typeof count === "number" && (
          <p className="mt-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold-brand/90">
            {count === 0 ? "Coming soon" : `${count} ${count === 1 ? "piece" : "pieces"}`}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold-brand opacity-0 -translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
          Explore <ArrowRight className="size-3" />
        </span>
      </div>
      <span className="pointer-events-none absolute inset-2 border border-gold-brand/0 transition-colors duration-500 group-hover:border-gold-brand/40 rounded-xl z-20" />
    </Link>
  );
}

export function CollectionGrid({ limit }: { limit?: number }) {
  const list = limit ? collections.slice(0, limit) : collections;
  const { data: counts } = useQuery({
    queryKey: ["collection-counts"],
    queryFn: fetchCollectionCounts,
    staleTime: 5 * 60_000,
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {list.map((c, i) => (
        <CollectionCard key={c.slug} collection={c} index={i} count={counts ? (counts[c.slug] ?? 0) : undefined} />
      ))}
    </div>
  );
}