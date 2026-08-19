import type { MetadataRoute } from "next";
import { STORE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const base = STORE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
