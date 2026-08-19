import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

/**
 * Product card for grids. Photo is the hero; name, brand, price, size and
 * condition follow the required visual hierarchy. SOLD items are clearly
 * badged and dimmed, with no order action (the whole card still links to the
 * detail page, which shows the disabled state).
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const sold = product.status === "sold";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-card border border-ink/10 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-paper-200">
        <ProductImage
          src={product.images?.[0]}
          alt={`${product.brand} ${product.name} — pre-owned ${product.category.toLowerCase()}, size ${product.size}`}
          priority={priority}
          className={sold ? "opacity-60 transition-transform duration-300 group-hover:scale-[1.03]" : "transition-transform duration-300 group-hover:scale-[1.03]"}
        />

        {/* Status / condition badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {sold ? (
            <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Sold
            </span>
          ) : (
            <span className="rounded-full bg-volt px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-ink">
              Available
            </span>
          )}
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink">
          {product.condition}
        </span>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{product.brand}</p>
        <h3 className="mt-0.5 line-clamp-1 font-display text-base text-ink">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-display text-lg text-ink">{formatPrice(product.price)}</p>
          <span className="rounded-md bg-paper px-2 py-0.5 text-xs font-semibold text-ink/70">
            Size {product.size}
          </span>
        </div>
      </div>
    </Link>
  );
}
