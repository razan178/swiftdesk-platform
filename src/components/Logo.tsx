import Link from "next/link";
import { STORE } from "@/lib/constants";

/**
 * Wordmark logo. Kept as text so it's crisp at every size and instantly
 * editable. To use the client's image logo instead, drop it in /public and
 * swap the inner markup for <Image src="/logo.svg" ... /> — see README.
 */
export function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${STORE.name} home`}
      className={`group inline-flex items-baseline gap-1 font-display text-xl sm:text-2xl ${className}`}
    >
      <span className={light ? "text-white" : "text-ink"}>ISLAMABAD</span>
      <span className="rounded bg-volt px-1.5 text-ink">THRIFT</span>
    </Link>
  );
}
