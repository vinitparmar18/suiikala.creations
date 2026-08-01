import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data?.role !== "admin") throw new Error("Forbidden: admin only");
}

// ---------- Dashboard ----------
export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabase } = context;
    const [ordersRes, productsRes, customersRes, recentRes] = await Promise.all([
      supabase.from("orders").select("total, status, payment_status, created_at"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, order_number, total, status, payment_status, created_at").order("created_at", { ascending: false }).limit(8),
    ]);
    const orders = ordersRes.data ?? [];
    const revenue = orders.filter(o => o.payment_status === "paid" || o.status === "delivered").reduce((s, o) => s + (o.total ?? 0), 0);
    const totalRevenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
    const now = Date.now();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 86400000);
      const day = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter(o => o.created_at?.slice(0, 10) === day);
      return { day, orders: dayOrders.length, revenue: dayOrders.reduce((s, o) => s + (o.total ?? 0), 0) };
    });
    return {
      ordersCount: orders.length,
      productsCount: productsRes.count ?? 0,
      customersCount: customersRes.count ?? 0,
      revenue,
      totalRevenue,
      pending: orders.filter(o => o.status === "order_placed" || o.status === "preparing").length,
      shipped: orders.filter(o => o.status === "shipped" || o.status === "out_for_delivery").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      last7,
      recent: recentRes.data ?? [],
    };
  });

// ---------- Products ----------
const ProductSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  price: z.number().int().nonnegative(),
  compare_at: z.number().int().nullable().optional(),
  category: z.string().optional().nullable(),
  collection: z.string().optional().nullable(),
  collections: z.array(z.string()).default([]), // 🔹 Multi-collections array support
  image: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  badge: z.string().optional().nullable(),
  stock: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  new_launch: z.boolean().default(false),

  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = { 
      ...data, 
      images: data.images as any,
      collections: data.collections as any // 🔹 Save collections array to Supabase
    };
    const { data: res, error } = data.id
      ? await context.supabase.from("products").update(row).eq("id", data.id).select("*").single()
      : await context.supabase.from("products").insert(row).select("*").single();
    if (error) throw new Error(error.message);
    return res;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Categories ----------
const CategorySchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const listCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("categories").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CategorySchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: res, error } = data.id
      ? await context.supabase.from("categories").update(data).eq("id", data.id).select("*").single()
      : await context.supabase.from("categories").insert(data).select("*").single();
    if (error) throw new Error(error.message);
    return res;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Orders ----------
export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, order_number, user_id, total, status, payment_status, payment_method, created_at, shipping_address")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const [{ data: order }, { data: items }, { data: history }] = await Promise.all([
      context.supabase.from("orders").select("*").eq("id", data.id).maybeSingle(),
      context.supabase.from("order_items").select("*").eq("order_id", data.id),
      context.supabase.from("order_status_history").select("*").eq("order_id", data.id).order("created_at"),
    ]);
    if (!order) throw new Error("Order not found");

    let customer: { name: string | null; email: string | null; phone: string | null } = {
      name: null,
      email: null,
      phone: null,
    };
    if ((order as any).user_id) {
      const { data: profile } = await context.supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", (order as any).user_id)
        .maybeSingle();
      customer.name = (profile as any)?.full_name ?? null;
      customer.phone = (profile as any)?.phone ?? null;
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById((order as any).user_id);
        customer.email = authUser?.user?.email ?? null;
      } catch {
        customer.email = null;
      }
    }
    const ship = ((order as any).shipping_address ?? {}) as Record<string, string>;
    customer.name = customer.name || ship.full_name || ship.name || null;
    customer.phone = customer.phone || ship.phone || null;
    customer.email = customer.email || ship.email || null;

    return { order, items: items ?? [], history: history ?? [], customer };
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string; note?: string; payment_status?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const upd: any = { status: data.status };
    if (data.payment_status) upd.payment_status = data.payment_status;
    const { error } = await context.supabase.from("orders").update(upd).eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("order_status_history").insert({
      order_id: data.id, status: data.status, note: data.note ?? null,
    });
    return { ok: true };
  });

// ---------- Customers ----------
export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [profiles, roles, orders] = await Promise.all([
      context.supabase.from("profiles").select("id, full_name, phone, avatar_url, created_at").order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("user_id, role"),
      context.supabase.from("orders").select("user_id, total"),
    ]);
    const roleMap = new Map<string, string[]>();
    (roles.data ?? []).forEach((r: any) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    const spendMap = new Map<string, { orders: number; spent: number }>();
    (orders.data ?? []).forEach((o: any) => {
      const cur = spendMap.get(o.user_id) ?? { orders: 0, spent: 0 };
      cur.orders += 1;
      cur.spent += o.total ?? 0;
      spendMap.set(o.user_id, cur);
    });
    return (profiles.data ?? []).map((p: any) => ({
      ...p,
      roles: roleMap.get(p.id) ?? [],
      orders: spendMap.get(p.id)?.orders ?? 0,
      spent: spendMap.get(p.id)?.spent ?? 0,
    }));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; role: "admin" | "customer"; grant: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.grant) {
      const { error } = await context.supabase.from("user_roles").insert({ user_id: data.user_id, role: data.role });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Coupons ----------
const CouponSchema = z.object({
  code: z.string().min(1),
  discount_percent: z.number().int().min(0).max(100),
  min_subtotal: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
  original_code: z.string().optional(),
});

export const listCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CouponSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { original_code, ...row } = data;
    row.code = row.code.toUpperCase();
    if (original_code) {
      const { error } = await context.supabase.from("coupons").update(row).eq("code", original_code);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("coupons").upsert(row);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { code: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("coupons").delete().eq("code", data.code);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Banners ----------
const BannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  position: z.string().default("hero"),
  active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const listBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("banners").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BannerSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: res, error } = data.id
      ? await context.supabase.from("banners").update(data).eq("id", data.id).select("*").single()
      : await context.supabase.from("banners").insert(data).select("*").single();
    if (error) throw new Error(error.message);
    return res;
  });

export const deleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("banners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Reviews ----------
export const listReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const setReviewApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; approved: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("reviews").update({ approved: data.approved }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Settings ----------
export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Record<string, unknown>) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("store_settings").update(data as any).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Role check ----------
export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return { admin: false };
    return { admin: data?.role === "admin" };
  });