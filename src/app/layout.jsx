import { Cormorant_Garamond, DM_Sans, Dancing_Script } from "next/font/google";
import SiteChrome from "@/components/layout/SiteChrome";
import JsonLd from "@/components/seo/JsonLd";
import Providers from "@/components/Providers";
import { brandJsonLdGraph, rootMetadata } from "@/lib/seo";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/** Decorative logo script — load on demand, not preloaded (avoids console warnings). */
const script = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "700",
  preload: false,
  display: "swap",
});

export const metadata = rootMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${script.variable}`}>
      <body className={`${body.className} min-h-screen flex flex-col antialiased`}>
        <JsonLd data={brandJsonLdGraph()} />
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
