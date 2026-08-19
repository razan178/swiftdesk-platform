import Link from "next/link";

/**
 * Friendly empty / no-results state. Never shows raw errors — used for an empty
 * store, no search matches, etc.
 */
export function EmptyState({
  title,
  message,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-card border border-dashed border-ink/15 bg-paper px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink">
        <span className="font-display text-lg text-volt">ITS</span>
      </div>
      <h2 className="mt-5 font-display text-2xl text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink/60">{message}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
