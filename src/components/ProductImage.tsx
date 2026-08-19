"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Product image with a graceful fallback. If the URL is missing or fails to
 * load, we show an on-brand placeholder instead of a broken image icon.
 */
export function ProductImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 50vw, 25vw",
  className = "",
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-paper-200",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <span className="font-display text-2xl text-ink/25">ITS</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
