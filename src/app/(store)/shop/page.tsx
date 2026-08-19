import type { Metadata } from "next";
import { getProducts, getBrands } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Filters } from "@/components/Filters";
import { EmptyState } from "@/components/EmptyState";
import { whatsappUrl } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import type { Category, Condition, Gender, Status } from "@/lib/constants";
import type { ProductFilters } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop pre-owned sneakers & shoes",
  description:
    "Browse thrift sneakers, sports shoes, boots and formal shoes in Islamabad & Rawalpindi. Filter by size, brand, price and condition. Order on WhatsApp.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const availabilityParam = one(sp.availability);
  const filters: ProductFilters = {
    gender: one(sp.gender) as Gender | undefined,
    category: one(sp.category) as Category | undefined,
    condition: one(sp.condition) as Condition | undefined,
    brand: one(sp.brand) || undefined,
    size: one(sp.size) || undefined,
    search: one(sp.q) || undefined,
    minPrice: one(sp.minPrice) ? Number(one(sp.minPrice)) : undefined,
    maxPrice: one(sp.maxPrice) ? Number(one(sp.maxPrice)) : undefined,
    availability: (availabilityParam as Status | "all") || "available",
  };

  const [products, brands] = await Promise.all([getProducts(filters), getBrands()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-4xl text-ink sm:text-5xl">The Shop</h1>
        <p className="mt-2 text-ink/60">
          {products.length > 0
            ? `${products.length} pair${products.length === 1 ? "" : "s"} ready to go`
            : "Hand-picked pre-owned shoes for Islamabad & Rawalpindi."}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <Filters brands={brands} />

        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pairs match yet"
              message="Try clearing a filter or two, or message us — we get new shoes in all the time and might have exactly what you want."
              ctaLabel="Ask on WhatsApp"
              ctaHref={whatsappUrl(`Hi ${STORE.name}, I'm looking for a specific pair. Can you help?`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
