"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { cn } from "@/lib/utils";

/**
 * Product image gallery: a large hero image plus selectable thumbnails.
 * Falls back to a single placeholder when a product has no photos.
 */
export function ProductGallery({ images, alt, sold }: { images: string[]; alt: string; sold?: boolean }) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : [undefined];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card border border-ink/10 bg-paper-200">
        <ProductImage
          src={gallery[active]}
          alt={alt}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={sold ? "opacity-70" : ""}
        />
        {sold && (
          <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-white">
            Sold
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-paper-200 transition-colors",
                i === active ? "border-ink" : "border-transparent hover:border-ink/30"
              )}
            >
              <ProductImage src={img} alt={`${alt} — view ${i + 1}`} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
