import Link from "next/link";
import { Logo } from "./Logo";
import { STORE } from "@/lib/constants";
import { whatsappUrl } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-white/60">
            Pre-owned shoes & thrift sneakers. Serving {STORE.serviceArea}. Unique finds,
            better prices, easy WhatsApp ordering.
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-wide text-volt">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/shop" className="hover:text-white">Shop All</Link></li>
            <li><Link href="/shop?gender=Men" className="hover:text-white">Men</Link></li>
            <li><Link href="/shop?gender=Women" className="hover:text-white">Women</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm uppercase tracking-wide text-volt">Order & Delivery</h2>
          <p className="mt-4 text-sm text-white/70">
            Delivery across {STORE.serviceArea}.<br />
            Delivery fee {STORE.deliveryFee} (confirmed on WhatsApp).
          </p>
          <a
            href={whatsappUrl(`Hi ${STORE.name}, I have a question about a pair.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-volt px-4 py-2 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {STORE.whatsappDisplay}
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} {STORE.name}. All rights reserved.</p>
          <Link href="/admin" className="hover:text-white/80">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
