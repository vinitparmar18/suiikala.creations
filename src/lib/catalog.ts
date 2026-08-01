import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id?: string;
  slug: string;
  name: string;
  price: number;
  compareAt?: number | null;
  category: string;
  collection: string;
  image: string;
  images?: string[];
  badge?: string | null;
  tagline: string;
  description: string;
  material: string;
  stock: number;
  rating: number;
  reviewCount: number;
  active?: boolean;
  featured?: boolean;
  newLaunch?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: string;
};

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#14532D'/>
        <stop offset='100%' stop-color='#0B6E4F'/>
      </linearGradient></defs>
      <rect width='600' height='600' fill='url(#g)'/>
      <text x='50%' y='50%' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-size='42' fill='#D4AF37' opacity='0.9'>Suii Kala</text>
    </svg>`,
  );

export const pickImage = (p: { images?: unknown; image?: string | null }): string => {
  const arr = Array.isArray(p.images) ? (p.images as unknown[]).filter((s): s is string => typeof s === "string" && s.length > 0) : [];
  if (arr.length > 0) return arr[0];
  if (p.image && p.image.length > 0) return p.image;
  return PLACEHOLDER_IMG;
};

export const pickImages = (p: { images?: unknown; image?: string | null }): string[] => {
  const arr = Array.isArray(p.images) ? (p.images as unknown[]).filter((s): s is string => typeof s === "string" && s.length > 0) : [];
  if (arr.length > 0) return arr;
  if (p.image) return [p.image];
  return [PLACEHOLDER_IMG];
};

export const mapProduct = (r: any): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  price: Number(r.price) || 0,
  compareAt: r.compare_at ?? null,
  category: r.category ?? "",
  collection: r.collection ?? "",
  image: pickImage(r),
  images: pickImages(r),
  badge: r.badge ?? null,
  tagline: r.tagline ?? "",
  description: r.description ?? "",
  material: r.material ?? "",
  stock: Number(r.stock) || 0,
  rating: Number(r.rating) || 0,
  reviewCount: Number(r.review_count) || 0,
  active: r.active,
  featured: !!r.featured,
  newLaunch: !!r.new_launch,
  seoTitle: r.seo_title ?? null,
  seoDescription: r.seo_description ?? null,
  createdAt: r.created_at,
});

const SELECT =
  "id, slug, name, tagline, description, material, price, compare_at, category, collection, image, images, badge, stock, rating, review_count, active, featured, new_launch, seo_title, seo_description, created_at";

export async function fetchAllProducts(): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select(SELECT)
    .eq("active", true);

  query = query.neq("collection", "his-favourites");

  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function fetchProductsByCollection(slug: string): Promise<Product[]> {
  let q = supabase.from("products").select(SELECT).eq("active", true);
  if (slug === "new-launches") q = q.eq("new_launch", true);
  else if (slug === "gift-hampers") q = q.or("category.eq.gift-hampers,collection.eq.gift-hampers");
  else if (slug === "under-999") q = q.lt("price", 1000);
  else q = q.eq("collection", slug);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchNewLaunches(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("active", true)
    .eq("new_launch", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchCollectionCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("products")
    .select("collection")
    .eq("active", true);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const key = (row as { collection: string | null }).collection;
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export async function fetchCategoryNames(): Promise<string[]> {
  const { data, error } = await supabase.from("products").select("category").eq("active", true);
  if (error) throw error;
  const set = new Set<string>();
  for (const row of data ?? []) {
    const c = (row as { category: string | null }).category;
    if (c) set.add(c);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function fetchProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .in("slug", slugs)
    .eq("active", true);
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function fetchFeatured(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("active", true)
    .eq("featured", true)
    .limit(limit);
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length > 0) return rows.map(mapProduct);
  
  const { data: fallback } = await supabase
    .from("products")
    .select(SELECT)
    .eq("active", true)
    .order("rating", { ascending: false })
    .limit(limit);
  return (fallback ?? []).map(mapProduct);
}

export async function fetchNewArrivals(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function searchProducts(q: string, limit = 40): Promise<Product[]> {
  if (!q.trim()) return [];
  const term = `%${q.trim()}%`;
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("active", true)
    .or(`name.ilike.${term},tagline.ilike.${term},category.ilike.${term},collection.ilike.${term},description.ilike.${term}`)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapProduct);
}