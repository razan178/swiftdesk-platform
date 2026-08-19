/**
 * Central store configuration. Editing these values updates the whole site —
 * no need to hunt through components.
 */

export const STORE = {
  name: "Islamabad Thrift Store",
  shortName: "Islamabad Thrift",
  tagline: "Pre-owned kicks. Unique finds. Better prices.",
  // Digits only, international format, no "+" or spaces — used for wa.me links.
  whatsappNumber: "923335020675",
  // Human-readable version for display.
  whatsappDisplay: "+92 333 5020675",
  serviceArea: "Islamabad & Rawalpindi",
  deliveryFee: "PKR 200–300",
  currency: "PKR",
  // Used for absolute URLs (OG tags, sitemap). Override with NEXT_PUBLIC_SITE_URL.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://islamabad-thrift-store.netlify.app",
} as const;

/** Product categories offered by the store. */
export const CATEGORIES = [
  "Sneakers",
  "Sports Shoes",
  "Boots",
  "Formal Shoes",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Gender / audience buckets. */
export const GENDERS = ["Men", "Women", "Unisex"] as const;
export type Gender = (typeof GENDERS)[number];

/** Condition grades, best to most worn. */
export const CONDITIONS = [
  "Like New",
  "Excellent",
  "Good",
  "Fair",
] as const;
export type Condition = (typeof CONDITIONS)[number];

/** Product availability status. */
export const STATUSES = ["available", "sold"] as const;
export type Status = (typeof STATUSES)[number];

/** Common shoe sizes (EU). Stored as free text on the product but handy for filters. */
export const SIZES = [
  "36", "37", "38", "39", "40", "41", "42",
  "43", "44", "45", "46", "47",
] as const;

/** Storage bucket name for product photos in Supabase. */
export const IMAGE_BUCKET = "product-images";

/** Upload constraints for admin image uploads. */
export const IMAGE_RULES = {
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB per image
  maxPerProduct: 6,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
  acceptAttr: "image/jpeg,image/png,image/webp",
} as const;
