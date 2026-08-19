"use client";

import Link from "next/link";

/**
 * Global error boundary — shown instead of a raw stack trace if a page throws.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-ink px-6 py-24 text-center text-white">
      <div>
        <p className="font-display text-6xl text-volt">Oops</p>
        <h1 className="mt-4 font-display text-2xl">Something went wrong.</h1>
        <p className="mt-2 text-white/60">
          Please try again in a moment. If it keeps happening, message us on WhatsApp.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-volt px-6 py-3 text-sm font-bold text-ink"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
