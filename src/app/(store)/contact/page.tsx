import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { whatsappUrl } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Islamabad Thrift Store on WhatsApp. Serving Islamabad & Rawalpindi with pre-owned shoes and easy ordering.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">Get in touch</h1>
      <p className="mt-3 text-lg text-ink/60">
        Questions about a pair, sizing, or delivery? We reply fastest on WhatsApp.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-card border border-ink/10 bg-paper p-6">
          <h2 className="font-display text-lg text-ink">{STORE.name}</h2>
          <p className="mt-2 text-sm text-ink/60">Serving {STORE.serviceArea}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">WhatsApp</p>
          <p className="font-semibold text-ink">{STORE.whatsappDisplay}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted">Delivery</p>
          <p className="text-sm text-ink/70">{STORE.serviceArea} · fee {STORE.deliveryFee}</p>
        </div>

        <div className="flex flex-col justify-between rounded-card bg-ink p-6 text-white">
          <div>
            <h2 className="font-display text-lg text-volt">Order or ask — instantly</h2>
            <p className="mt-2 text-sm text-white/70">
              Tap below to open a chat with us. Tell us which pair you want and we&apos;ll confirm
              availability and delivery.
            </p>
          </div>
          <a
            href={whatsappUrl(`Hi ${STORE.name}, I have a question.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
          </a>
        </div>
      </div>

      <p className="mt-8 text-sm text-ink/50">
        We&apos;re an online-first thrift store — no physical storefront. Everything is handled over
        WhatsApp, with delivery across {STORE.serviceArea}.
      </p>
    </div>
  );
}
