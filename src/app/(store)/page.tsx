import Link from "next/link";
import { getLatestProducts, getActiveCategories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { ArrowIcon, WhatsAppIcon } from "@/components/icons";
import { STORE } from "@/lib/constants";
import { whatsappUrl } from "@/lib/utils";

// Always render fresh so newly added products show up immediately.
export const dynamic = "force-dynamic";

const TICKER = [
  "PRE-OWNED SNEAKERS",
  "UNIQUE FINDS",
  "BETTER PRICES",
  "ISLAMABAD × RAWALPINDI",
  "ONE-OF-ONE PAIRS",
  "FRESH DROPS WEEKLY",
];

const WHY = [
  { title: "Affordable prices", body: "Premium looks for a fraction of retail. Style that respects your budget." },
  { title: "One-of-one finds", body: "Most pairs are unique. When it's gone, it's gone — grab it before someone else does." },
  { title: "Carefully selected", body: "Every pair is hand-picked and quality-checked before it hits the shop." },
  { title: "Local delivery", body: `Fast delivery across ${STORE.serviceArea}. Simple ordering, no complicated checkout.` },
];

export default async function HomePage() {
  const [latest, categories] = await Promise.all([
    getLatestProducts(8),
    getActiveCategories(),
  ]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-volt/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-volt">
              Thrift Sneakers · {STORE.serviceArea}
            </span>
            <h1 className="mt-5 font-display text-5xl uppercase sm:text-6xl lg:text-7xl">
              Find your<br />next pair.
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/70">
              Pre-owned shoes, unique finds and better prices. Hand-picked kicks for
              Islamabad &amp; Rawalpindi — ordered straight through WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-volt px-7 py-4 font-display text-lg text-ink transition-transform hover:-translate-y-0.5"
              >
                Shop Now <ArrowIcon className="h-5 w-5" />
              </Link>
              <a
                href={whatsappUrl(`Hi ${STORE.name}, what's fresh in stock?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <WhatsAppIcon className="h-5 w-5" /> Ask on WhatsApp
              </a>
            </div>
          </div>

          {/* Decorative hero panel */}
          <div className="relative hidden md:block">
            <div className="aspect-[4/5] rounded-card border border-white/10 bg-gradient-to-br from-ink-800 to-ink p-8">
              <div className="flex h-full flex-col justify-between">
                <p className="font-display text-8xl leading-none text-volt/90">ITS</p>
                <div>
                  <p className="font-display text-2xl text-white">Thrift culture,<br />done right.</p>
                  <p className="mt-3 text-sm text-white/50">
                    New pairs land regularly. Follow the drops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="border-y border-white/10 bg-volt py-3 text-ink">
          <div className="flex overflow-hidden whitespace-nowrap">
            <div className="animate-marquee flex shrink-0 items-center gap-6 pr-6 font-display text-sm uppercase">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="flex items-center gap-6">
                  {t} <span aria-hidden>✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest drops ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-wide text-volt-600">Fresh arrivals</p>
            <h2 className="mt-1 font-display text-3xl text-ink sm:text-4xl">Latest Drops</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-1 text-sm font-bold text-ink hover:gap-2 sm:inline-flex">
            View all <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {latest.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="Fresh drops coming soon"
              message="We're sourcing the next batch of pairs right now. Message us on WhatsApp to get first pick."
              ctaLabel="Chat on WhatsApp"
              ctaHref={whatsappUrl(`Hi ${STORE.name}, let me know when new shoes drop!`)}
            />
          </div>
        )}
      </section>

      {/* ── Shop by category ─────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-paper py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">Shop by Category</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="group flex aspect-video items-center justify-center rounded-card border border-ink/10 bg-white p-4 text-center transition-colors hover:border-ink hover:bg-ink"
                >
                  <span className="font-display text-lg text-ink transition-colors group-hover:text-volt">
                    {cat}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Shop Men / Women ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Shop Men", href: "/shop?gender=Men", sub: "Sneakers, boots & more" },
            { label: "Shop Women", href: "/shop?gender=Women", sub: "Standout everyday pairs" },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group relative flex h-44 flex-col justify-between overflow-hidden rounded-card bg-ink p-7 text-white sm:h-56"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-volt/15 blur-2xl transition-all group-hover:bg-volt/25" />
              <p className="text-sm text-white/60">{c.sub}</p>
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl uppercase sm:text-4xl">{c.label}</span>
                <ArrowIcon className="h-6 w-6 text-volt transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why us ───────────────────────────────────────────── */}
      <section className="bg-paper py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            Why {STORE.shortName}?
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item, i) => (
              <div key={item.title} className="rounded-card border border-ink/10 bg-white p-6">
                <span className="font-display text-3xl text-volt-600">0{i + 1}</span>
                <h3 className="mt-3 font-display text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-card bg-ink px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top,var(--color-volt),transparent_60%)]" />
          <h2 className="relative font-display text-4xl uppercase sm:text-5xl">
            Your next pair is waiting.
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/70">
            Unique, pre-owned and priced to move. Browse the latest and order in seconds.
          </p>
          <Link
            href="/shop"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-volt px-8 py-4 font-display text-lg text-ink transition-transform hover:-translate-y-0.5"
          >
            Explore the Shop <ArrowIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
