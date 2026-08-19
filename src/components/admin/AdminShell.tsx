import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/products/new", label: "Add Product" },
];

/**
 * Chrome for authenticated admin pages: top bar with navigation, a link back
 * to the live store, and sign-out. Rendered per-page so the login screen stays
 * standalone.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg">
              ISLAMABAD<span className="ml-1 rounded bg-volt px-1.5 text-ink">ADMIN</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-white/70 hover:text-white" target="_blank">
              View store ↗
            </Link>
            <SignOutButton />
          </div>
        </div>
        <nav className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-white/70 hover:border-volt hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
