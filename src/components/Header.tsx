"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?gender=Men", label: "Men" },
  { href: "/shop?gender=Women", label: "Women" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-ink/70 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/shop"
            className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Shop Now
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink/15 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="relative block h-4 w-5">
            <span
              className={cn(
                "absolute left-0 h-0.5 w-5 bg-ink transition-all",
                open ? "top-1.5 rotate-45" : "top-0"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 h-0.5 w-5 bg-ink transition-all",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-0.5 w-5 bg-ink transition-all",
                open ? "top-1.5 -rotate-45" : "top-3"
              )}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-ink/10 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/5 py-3 text-base font-semibold text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-full bg-volt px-5 py-3 text-center text-base font-bold text-ink"
            >
              Shop Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
