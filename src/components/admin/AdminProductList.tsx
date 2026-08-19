"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * Interactive admin product table. Handles marking sold/available, deleting
 * (with confirm), and links to the edit form. Writes go through the browser
 * Supabase client — allowed only because the admin is authenticated (RLS).
 */
export function AdminProductList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "sold">("all");

  const supabase = createClient();

  async function toggleStatus(p: Product) {
    setError(null);
    setBusyId(p.id);
    const next = p.status === "sold" ? "available" : "sold";
    const { error } = await supabase.from("products").update({ status: next }).eq("id", p.id);
    setBusyId(null);
    if (error) {
      setError(`Couldn't update "${p.name}". ${error.message}`);
      return;
    }
    router.refresh();
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.brand} ${p.name}" permanently? This cannot be undone.`)) return;
    setError(null);
    setBusyId(p.id);

    // Best-effort: remove the product's images from storage too.
    try {
      const paths = (p.images ?? [])
        .map((url) => url.split("/product-images/")[1])
        .filter(Boolean) as string[];
      if (paths.length) await supabase.storage.from("product-images").remove(paths);
    } catch {
      // Non-fatal — the DB row is what matters.
    }

    const { error } = await supabase.from("products").delete().eq("id", p.id);
    setBusyId(null);
    if (error) {
      setError(`Couldn't delete "${p.name}". ${error.message}`);
      return;
    }
    router.refresh();
  }

  const visible = products.filter((p) => filter === "all" || p.status === filter);

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-flame/10 px-4 py-3 text-sm font-medium text-flame">
          {error}
        </p>
      )}

      <div className="mb-4 flex gap-2">
        {(["all", "available", "sold"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors",
              filter === f ? "bg-ink text-white" : "border border-ink/15 text-ink hover:bg-paper"
            )}
          >
            {f} ({f === "all" ? products.length : products.filter((p) => p.status === f).length})
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-card border border-ink/10 bg-white">
        <div className="hidden grid-cols-[3rem_1fr_7rem_5rem_6rem_auto] items-center gap-3 border-b border-ink/10 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted sm:grid">
          <span></span><span>Product</span><span>Price</span><span>Size</span><span>Status</span><span className="text-right">Actions</span>
        </div>

        <ul className="divide-y divide-ink/5">
          {visible.map((p) => (
            <li key={p.id} className="grid grid-cols-[3rem_1fr] items-center gap-3 px-4 py-3 sm:grid-cols-[3rem_1fr_7rem_5rem_6rem_auto]">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-paper-200">
                <ProductImage src={p.images?.[0]} alt={p.name} sizes="48px" />
              </div>

              <div className="min-w-0">
                <Link href={`/admin/products/${p.id}/edit`} className="block truncate font-semibold text-ink hover:underline">
                  {p.brand} {p.name}
                </Link>
                <p className="truncate text-xs text-ink/50 sm:hidden">
                  {formatPrice(p.price)} · Size {p.size} · {p.status}
                </p>
              </div>

              <span className="hidden text-sm text-ink sm:block">{formatPrice(p.price)}</span>
              <span className="hidden text-sm text-ink sm:block">{p.size}</span>
              <span className="hidden sm:block">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold uppercase", p.status === "sold" ? "bg-ink text-white" : "bg-volt text-ink")}>
                  {p.status}
                </span>
              </span>

              <div className="col-span-2 mt-2 flex flex-wrap items-center justify-end gap-2 sm:col-span-1 sm:mt-0">
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => toggleStatus(p)}
                  disabled={busyId === p.id}
                  className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper disabled:opacity-50"
                >
                  {busyId === p.id ? "…" : p.status === "sold" ? "Restore" : "Mark sold"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(p)}
                  disabled={busyId === p.id}
                  className="rounded-full border border-flame/30 px-3 py-1.5 text-xs font-semibold text-flame hover:bg-flame/10 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
