import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { STORE } from "@/lib/constants";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(STORE.url),
  title: {
    default: `${STORE.name} — Pre-owned Sneakers in Islamabad & Rawalpindi`,
    template: `%s · ${STORE.name}`,
  },
  description:
    "Thrift sneakers and pre-owned shoes in Islamabad & Rawalpindi. Unique finds, affordable prices, easy WhatsApp ordering. Fresh drops added regularly.",
  keywords: [
    "Islamabad thrift shoes",
    "Rawalpindi thrift shoes",
    "used shoes Islamabad",
    "pre-owned shoes Pakistan",
    "thrift sneakers Islamabad",
    "affordable sneakers Islamabad",
  ],
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `${STORE.name} — Pre-owned Sneakers`,
    description:
      "Unique pre-owned shoes in Islamabad & Rawalpindi. Better prices. Order on WhatsApp.",
    url: STORE.url,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: `${STORE.name} — Pre-owned Sneakers`,
    description:
      "Unique pre-owned shoes in Islamabad & Rawalpindi. Better prices. Order on WhatsApp.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-ink">{children}</body>
    </html>
  );
}
