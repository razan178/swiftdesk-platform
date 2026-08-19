import { WhatsAppIcon } from "./icons";
import { whatsappOrderUrl } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * "Order on WhatsApp" button. Opens WhatsApp with a pre-filled order message
 * for the given product. Disabled state shown for SOLD items.
 */
export function WhatsAppButton({
  product,
  sold = false,
  className = "",
  size = "md",
}: {
  product: Pick<Product, "name" | "brand" | "size" | "price">;
  sold?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  if (sold) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink/10 font-bold text-ink/40",
          sizes[size],
          className
        )}
      >
        Sold — no longer available
      </button>
    );
  }

  return (
    <a
      href={whatsappOrderUrl(product)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]",
        sizes[size],
        className
      )}
    >
      <WhatsAppIcon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      Order on WhatsApp
    </a>
  );
}
