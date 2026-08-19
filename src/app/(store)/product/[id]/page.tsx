import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { ProductGallery } from "@/components/ProductGallery";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { formatPrice } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import { ArrowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const title = `${product.brand} ${product.name} — Size ${product.size}`;
  const description = `${product.condition} condition, ${formatPrice(product.price)}. Pre-owned ${product.category.toLowerCase()} in Islamabad & Rawalpindi. Order on WhatsApp.`;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper px-3 py-2.5">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const sold = product.status === "sold";
  const alt = `${product.brand} ${product.name} — pre-owned ${product.category.toLowerCase()}, size ${product.size}`;

  // Structured data for search engines.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    description: product.description || alt,
    image: product.images ?? [],
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PKR",
      availability: sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      areaServed: STORE.serviceArea,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <span aria-hidden>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images ?? []} alt={alt} sold={sold} />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <p className="font-display text-3xl text-ink">{formatPrice(product.price)}</p>
            {sold ? (
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase text-white">Sold</span>
            ) : (
              <span className="rounded-full bg-volt px-3 py-1 text-xs font-bold uppercase text-ink">Available</span>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Spec label="Size (EU)" value={product.size || "—"} />
            <Spec label="Condition" value={product.condition} />
            <Spec label="Category" value={product.category} />
            <Spec label="Audience" value={product.gender} />
            <Spec label="Brand" value={product.brand} />
            <Spec label="Status" value={sold ? "Sold" : "Available"} />
          </dl>

          {product.description && (
            <div className="mt-6">
              <h2 className="font-display text-lg text-ink">Details</h2>
              <p className="mt-2 whitespace-pre-line text-ink/70">{product.description}</p>
            </div>
          )}

          {/* Delivery info — present but understated */}
          <div className="mt-6 rounded-lg border border-ink/10 bg-paper px-4 py-3 text-sm text-ink/70">
            <span className="font-semibold text-ink">Delivery:</span> {STORE.serviceArea} · fee {STORE.deliveryFee}
            {" "}(confirmed on WhatsApp).
          </div>

          {/* Order CTA */}
          <div className="mt-6">
            <WhatsAppButton product={product} sold={sold} size="lg" />
            {sold ? (
              <p className="mt-3 text-center text-sm text-muted">
                This one found a new home.{" "}
                <Link href="/shop" className="font-semibold text-ink underline">See what&apos;s still available</Link>.
              </p>
            ) : (
              <p className="mt-3 text-center text-sm text-muted">
                One-of-one — order now before it&apos;s gone.
              </p>
            )}
          </div>

          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-ink hover:gap-2"
          >
            <ArrowIcon className="h-4 w-4 rotate-180" /> Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
