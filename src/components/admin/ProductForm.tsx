"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CONDITIONS, GENDERS, STATUSES } from "@/lib/constants";
import type { Product, ProductInput } from "@/lib/types";

const EMPTY: ProductInput = {
  name: "",
  brand: "",
  category: "Sneakers",
  gender: "Unisex",
  size: "",
  price: 0,
  condition: "Good",
  description: "",
  images: [],
  status: "available",
};

/**
 * Create/edit form for a product. Writes via the authenticated browser
 * Supabase client (RLS permits it only for signed-in admins).
 */
export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [form, setForm] = useState<ProductInput>(
    product
      ? {
          name: product.name,
          brand: product.brand,
          category: product.category,
          gender: product.gender,
          size: product.size,
          price: product.price,
          condition: product.condition,
          description: product.description,
          images: product.images ?? [],
          status: product.status,
        }
      : EMPTY
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ProductInput>(key: K, val: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.brand.trim()) return "Brand is required.";
    if (!form.size.trim()) return "Size is required.";
    if (!Number.isFinite(form.price) || form.price < 0) return "Enter a valid price.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const payload = {
      ...form,
      name: form.name.trim(),
      brand: form.brand.trim(),
      size: form.size.trim(),
      price: Math.round(form.price),
    };

    const { error } = isEdit
      ? await supabase.from("products").update(payload).eq("id", product!.id)
      : await supabase.from("products").insert(payload);

    if (error) {
      setSaving(false);
      setError(`Couldn't save the product. ${error.message}`);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  const inputCls =
    "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-ink focus:border-ink focus:outline-none";
  const labelCls = "text-sm font-semibold text-ink";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg bg-flame/10 px-4 py-3 text-sm font-medium text-flame">
          {error}
        </p>
      )}

      {/* Photos */}
      <section className="rounded-card border border-ink/10 bg-white p-5">
        <h2 className="font-display text-lg text-ink">Photos</h2>
        <p className="mb-4 text-sm text-ink/60">Add clear photos of the actual pair.</p>
        <ImageUploader value={form.images} onChange={(imgs) => set("images", imgs)} />
      </section>

      {/* Details */}
      <section className="rounded-card border border-ink/10 bg-white p-5">
        <h2 className="mb-4 font-display text-lg text-ink">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="name">Product name</label>
            <input id="name" className={inputCls} value={form.name}
              onChange={(e) => set("name", e.target.value)} placeholder="e.g. Air Max 90 Grey" required />
          </div>

          <div>
            <label className={labelCls} htmlFor="brand">Brand</label>
            <input id="brand" className={inputCls} value={form.brand}
              onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Nike" required />
          </div>

          <div>
            <label className={labelCls} htmlFor="category">Category</label>
            <select id="category" className={inputCls} value={form.category}
              onChange={(e) => set("category", e.target.value as ProductInput["category"])}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="gender">Audience</label>
            <select id="gender" className={inputCls} value={form.gender}
              onChange={(e) => set("gender", e.target.value as ProductInput["gender"])}>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="size">Size (EU)</label>
            <input id="size" className={inputCls} value={form.size}
              onChange={(e) => set("size", e.target.value)} placeholder="e.g. 42" required />
          </div>

          <div>
            <label className={labelCls} htmlFor="price">Price (PKR)</label>
            <input id="price" type="number" min={0} inputMode="numeric" className={inputCls}
              value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))}
              placeholder="e.g. 4500" required />
          </div>

          <div>
            <label className={labelCls} htmlFor="condition">Condition</label>
            <select id="condition" className={inputCls} value={form.condition}
              onChange={(e) => set("condition", e.target.value as ProductInput["condition"])}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="description">Description</label>
            <textarea id="description" rows={4} className={inputCls} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Any details worth mentioning — colour, fit, small flaws, why it's a great pair…" />
          </div>

          <div>
            <label className={labelCls} htmlFor="status">Availability</label>
            <select id="status" className={inputCls} value={form.status}
              onChange={(e) => set("status", e.target.value as ProductInput["status"])}>
              {STATUSES.map((s) => <option key={s} value={s}>{s === "available" ? "Available" : "Sold"}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ink px-7 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Publish product"}
        </button>
        <Link href="/admin/products" className="rounded-full border border-ink/15 px-7 py-3 font-semibold text-ink hover:bg-paper">
          Cancel
        </Link>
      </div>
    </form>
  );
}
