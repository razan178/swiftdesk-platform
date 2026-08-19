import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-ink px-6 py-24 text-center text-white">
      <div>
        <p className="font-display text-7xl text-volt">404</p>
        <h1 className="mt-4 font-display text-3xl">This pair walked off.</h1>
        <p className="mt-2 text-white/60">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-full bg-volt px-6 py-3 text-sm font-bold text-ink">
            Back home
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Browse the shop
          </Link>
        </div>
      </div>
    </main>
  );
}
