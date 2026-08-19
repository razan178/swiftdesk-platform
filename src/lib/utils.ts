import { STORE } from "./constants";
import type { Product } from "./types";

/** Format a whole-number PKR price as "PKR 4,500". */
export function formatPrice(price: number): string {
  const safe = Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0;
  return `${STORE.currency} ${safe.toLocaleString("en-US")}`;
}

/** Build a WhatsApp click-to-chat URL with a pre-filled order message. */
export function whatsappOrderUrl(product: Pick<Product, "name" | "brand" | "size" | "price">): string {
  const message =
    `Hi ${STORE.name}, I want to order:\n` +
    `Product: ${product.name}\n` +
    `Brand: ${product.brand}\n` +
    `Size: ${product.size}\n` +
    `Price: ${formatPrice(product.price)}\n\n` +
    `Please confirm availability and delivery.`;
  return `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Generic WhatsApp URL with an optional custom message (used for contact CTAs). */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${STORE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Relative "time ago" label for the dashboard (e.g. "2 days ago"). */
export function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.round((Date.now() - then) / 1000);
  const table: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [2592000, "day"],
    [31536000, "month"],
    [Infinity, "year"],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let prevLimit = 1;
  for (const [limit, unit] of table) {
    if (seconds < limit) {
      const value = Math.round(-seconds / prevLimit);
      return rtf.format(value, unit);
    }
    prevLimit = limit;
  }
  return "";
}

/** Merge conditional class names (tiny clsx replacement, no dependency). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
