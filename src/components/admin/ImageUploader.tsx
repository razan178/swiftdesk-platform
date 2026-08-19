"use client";

import { useRef, useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_BUCKET, IMAGE_RULES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Multi-image uploader for the product form. Uploads files straight to Supabase
 * Storage (authenticated), keeping only the public URLs in the product record.
 * Supports previews, removing, and choosing the cover image. Validates type and
 * size before uploading.
 */
export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = IMAGE_RULES.maxPerProduct - value.length;
    if (remaining <= 0) {
      setError(`You can add up to ${IMAGE_RULES.maxPerProduct} images per product.`);
      return;
    }

    const chosen = Array.from(files).slice(0, remaining);
    setUploading(true);
    const uploaded: string[] = [];

    for (const file of chosen) {
      if (!(IMAGE_RULES.acceptedTypes as readonly string[]).includes(file.type)) {
        setError("Only JPG, PNG or WEBP images are allowed.");
        continue;
      }
      if (file.size > IMAGE_RULES.maxSizeBytes) {
        setError(`Each image must be under ${IMAGE_RULES.maxSizeBytes / (1024 * 1024)} MB.`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (upErr) {
        setError(`Upload failed: ${upErr.message}`);
        continue;
      }
      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      if (data?.publicUrl) uploaded.push(data.publicUrl);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (uploaded.length) onChange([...value, ...uploaded]);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={url} className="relative h-28 w-28 overflow-hidden rounded-lg border border-ink/10 bg-paper-200">
            <ProductImage src={url} alt={`Product image ${i + 1}`} sizes="112px" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-volt px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink">
                Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-ink/70 p-1">
              {i !== 0 && (
                <button type="button" onClick={() => makeCover(i)} className="text-[10px] font-semibold text-white hover:text-volt">
                  Cover
                </button>
              )}
              <button type="button" onClick={() => removeAt(i)} className="ml-auto text-[10px] font-semibold text-white hover:text-flame">
                Remove
              </button>
            </div>
          </div>
        ))}

        {value.length < IMAGE_RULES.maxPerProduct && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex h-28 w-28 flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink/20 text-sm font-semibold text-ink/50 hover:border-ink hover:text-ink",
              uploading && "opacity-60"
            )}
          >
            {uploading ? "Uploading…" : (<><span className="text-2xl">+</span>Add photo</>)}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_RULES.acceptAttr}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-xs text-ink/50">
        Up to {IMAGE_RULES.maxPerProduct} photos · JPG, PNG or WEBP · max{" "}
        {IMAGE_RULES.maxSizeBytes / (1024 * 1024)} MB each. The first image is the cover.
      </p>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-flame">{error}</p>}
    </div>
  );
}
