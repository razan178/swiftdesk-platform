import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/constants";
import { ArrowIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Islamabad Thrift Store gives quality pre-owned shoes another life — unique finds at affordable prices for Islamabad & Rawalpindi, ordered easily on WhatsApp.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { title: "Unique over mass-produced", body: "Most of our pairs are one-of-one. You won't see the same shoe on everyone else." },
  { title: "Affordable, always", body: "Great shoes shouldn't cost a fortune. Thrift pricing keeps style within reach." },
  { title: "A second life", body: "Good shoes deserve to be worn, not thrown away. We rescue quality pairs and pass them on." },
  { title: "Simple to order", body: "No complicated checkout. See a pair you like, tap WhatsApp, and we sort out the rest." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-display text-sm uppercase tracking-wide text-volt">Our story</p>
          <h1 className="mt-2 font-display text-4xl uppercase sm:text-5xl">
            Pre-owned kicks,<br />picked with care.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            {STORE.name} is a thrift shoe store for {STORE.serviceArea}. We hunt down quality
            pre-owned shoes — sneakers, boots, sports and formal pairs — clean them up, and give
            them another life on someone new.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="prose-none space-y-5 text-lg text-ink/80">
          <p>
            Thrift culture is about finding something special without overpaying for it. Every pair
            we list is hand-picked and checked, then priced to move. Because most pieces are unique,
            when a pair is gone, it&apos;s gone — that&apos;s part of the fun.
          </p>
          <p>
            We keep things simple. Browse the shop, find a pair you love, and order straight through
            WhatsApp. We confirm availability and delivery, and get your shoes to you across
            Islamabad and Rawalpindi.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-card border border-ink/10 bg-paper p-6">
              <h2 className="font-display text-lg text-ink">{v.title}</h2>
              <p className="mt-2 text-sm text-ink/60">{v.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 font-display text-lg text-white transition-transform hover:-translate-y-0.5">
            Browse the shop <ArrowIcon className="h-5 w-5" />
          </Link>
          <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-ink/15 px-7 py-4 font-semibold text-ink hover:bg-paper">
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
