"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CATEGORIES, CONDITIONS, GENDERS, SIZES } from "@/lib/constants";
import { FilterIcon, SearchIcon } from "./icons";
import { cn } from "@/lib/utils";

/**
 * Shop filters. Every change rewrites the URL query string, so filters are
 * shareable/bookmarkable and the server re-queries. On mobile the panel is a
 * collapsible drawer to keep things thumb-friendly.
 */
export function Filters({ brands }: { brands: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [openMobile, setOpenMobile] = useState(false);

  const current = (key: string) => params.get(key) ?? "";

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value);
      else sp.delete(key);
    }
    startTransition(() => {
      router.push(`/shop?${sp.toString()}`, { scroll: false });
    });
  }

  const activeCount = ["gender", "brand", "size", "category", "condition", "minPrice", "maxPrice", "availability", "q"].filter(
    (k) => params.get(k)
  ).length;

  const selectCls =
    "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none";
  const labelCls = "text-xs font-bold uppercase tracking-wide text-muted";

  const panel = (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className={labelCls} htmlFor="f-search">Search</label>
        <div className="relative mt-1.5">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="f-search"
            type="search"
            defaultValue={current("q")}
            placeholder="Name or brand…"
            onKeyDown={(e) => {
              if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value });
            }}
            onBlur={(e) => update({ q: e.target.value })}
            className={cn(selectCls, "pl-9")}
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <span className={labelCls}>Availability</span>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {[
            { v: "", label: "Available" },
            { v: "sold", label: "Sold" },
            { v: "all", label: "All" },
          ].map((opt) => {
            const active = current("availability") === opt.v;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => update({ availability: opt.v })}
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                  active ? "border-ink bg-ink text-white" : "border-ink/15 text-ink hover:border-ink"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className={labelCls} htmlFor="f-gender">Audience</label>
        <select id="f-gender" className={cn(selectCls, "mt-1.5")} value={current("gender")}
          onChange={(e) => update({ gender: e.target.value })}>
          <option value="">Everyone</option>
          {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className={labelCls} htmlFor="f-category">Category</label>
        <select id="f-category" className={cn(selectCls, "mt-1.5")} value={current("category")}
          onChange={(e) => update({ category: e.target.value })}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className={labelCls} htmlFor="f-brand">Brand</label>
        <select id="f-brand" className={cn(selectCls, "mt-1.5")} value={current("brand")}
          onChange={(e) => update({ brand: e.target.value })}>
          <option value="">All brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Size */}
      <div>
        <label className={labelCls} htmlFor="f-size">Size (EU)</label>
        <select id="f-size" className={cn(selectCls, "mt-1.5")} value={current("size")}
          onChange={(e) => update({ size: e.target.value })}>
          <option value="">Any size</option>
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Condition */}
      <div>
        <label className={labelCls} htmlFor="f-condition">Condition</label>
        <select id="f-condition" className={cn(selectCls, "mt-1.5")} value={current("condition")}
          onChange={(e) => update({ condition: e.target.value })}>
          <option value="">Any condition</option>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <span className={labelCls}>Price (PKR)</span>
        <div className="mt-1.5 flex items-center gap-2">
          <input type="number" min={0} inputMode="numeric" placeholder="Min" defaultValue={current("minPrice")}
            onBlur={(e) => update({ minPrice: e.target.value })}
            className={cn(selectCls, "w-full")} />
          <span className="text-muted">–</span>
          <input type="number" min={0} inputMode="numeric" placeholder="Max" defaultValue={current("maxPrice")}
            onBlur={(e) => update({ maxPrice: e.target.value })}
            className={cn(selectCls, "w-full")} />
        </div>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push("/shop", { scroll: false }))}
          className="w-full rounded-lg border border-ink/15 py-2.5 text-sm font-semibold text-ink hover:bg-paper"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink"
        >
          <FilterIcon className="h-4 w-4" />
          Filters {activeCount > 0 && <span className="rounded-full bg-ink px-1.5 text-xs text-volt">{activeCount}</span>}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className={cn("hidden lg:block", isPending && "opacity-60")}>
        <h2 className="mb-4 font-display text-lg text-ink">Filters</h2>
        {panel}
      </aside>

      {/* Mobile drawer */}
      {openMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpenMobile(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Filters</h2>
              <button type="button" onClick={() => setOpenMobile(false)} className="text-sm font-semibold text-muted">
                Close
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              className="mt-5 w-full rounded-full bg-ink py-3 font-bold text-white"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
