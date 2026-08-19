import { WhatsAppIcon } from "./icons";
import { whatsappUrl } from "@/lib/utils";
import { STORE } from "@/lib/constants";

/**
 * Floating WhatsApp chat button, always within thumb's reach. Uses a general
 * enquiry message (product pages have their own order button).
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappUrl(`Hi ${STORE.name}, I'd like to ask about your available shoes.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
