import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";
import type { Product, ProductFilters } from "./types";

/**
 * Server-side product reads used by the public store and admin pages.
 * Every function degrades gracefully when Supabase isn't configured yet or a
 * query fails — the UI then shows an empty / "coming soon" state instead of
 * crashing.
 */

const TABLE = "products";

/** Fetch products for the public shop with optional filters (available only by default). */
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });

    // Availability: default to "available" for the public store.
    const availability = filters.availability ?? "available";
    if (availability !== "all") query = query.eq("status", availability);

    if (filters.gender) query = query.eq("gender", filters.gender);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.condition) query = query.eq("condition", filters.condition);
    if (filters.size) query = query.eq("size", filters.size);
    if (filters.brand) query = query.ilike("brand", filters.brand);
    if (typeof filters.minPrice === "number") query = query.gte("price", filters.minPrice);
    if (typeof filters.maxPrice === "number") query = query.lte("price", filters.maxPrice);
    if (filters.search) {
      // Strip characters that have special meaning in a PostgREST `.or()`
      // filter (commas separate conditions, parentheses group them) so a
      // stray comma in the search box can't break the query.
      const clean = filters.search.replace(/[(),]/g, " ").trim();
      if (clean) {
        const term = `%${clean}%`;
        query = query.or(`name.ilike.${term},brand.ilike.${term}`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Product[]) ?? [];
  } catch (err) {
    console.error("getProducts failed:", err);
    return [];
  }
}

/** Fetch the N most recently added available products (homepage "latest drops"). */
export async function getLatestProducts(limit = 8): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as Product[]) ?? [];
  } catch (err) {
    console.error("getLatestProducts failed:", err);
    return [];
  }
}

/** Fetch a single product by id (any status, so SOLD pages still render). */
export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Product) ?? null;
  } catch (err) {
    console.error("getProductById failed:", err);
    return null;
  }
}

/** All products, newest first — used by the admin management screen. */
export async function getAllProductsForAdmin(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Product[]) ?? [];
  } catch (err) {
    console.error("getAllProductsForAdmin failed:", err);
    return [];
  }
}

/** Distinct brand names present in the catalogue, for the filter dropdown. */
export async function getBrands(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(TABLE).select("brand");
    if (error) throw error;
    const set = new Set<string>();
    (data as { brand: string }[]).forEach((r) => r.brand && set.add(r.brand));
    return [...set].sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.error("getBrands failed:", err);
    return [];
  }
}

/** Distinct categories that actually have available products (homepage sections). */
export async function getActiveCategories(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(TABLE).select("category").eq("status", "available");
    if (error) throw error;
    const set = new Set<string>();
    (data as { category: string }[]).forEach((r) => r.category && set.add(r.category));
    return [...set];
  } catch (err) {
    console.error("getActiveCategories failed:", err);
    return [];
  }
}

/** Simple counts for the admin dashboard. */
export async function getStats(): Promise<{ total: number; available: number; sold: number }> {
  const empty = { total: 0, available: 0, sold: 0 };
  if (!isSupabaseConfigured()) return empty;
  try {
    const supabase = await createClient();
    const [total, available, sold] = await Promise.all([
      supabase.from(TABLE).select("*", { count: "exact", head: true }),
      supabase.from(TABLE).select("*", { count: "exact", head: true }).eq("status", "available"),
      supabase.from(TABLE).select("*", { count: "exact", head: true }).eq("status", "sold"),
    ]);
    return {
      total: total.count ?? 0,
      available: available.count ?? 0,
      sold: sold.count ?? 0,
    };
  } catch (err) {
    console.error("getStats failed:", err);
    return empty;
  }
}
