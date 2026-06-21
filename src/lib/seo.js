import { categories, site } from "./site";

/** Canonical production URL — used for sitemap, canonical tags, and JSON-LD */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mounismaguva.com").replace(
  /\/$/,
  "",
);

export const BRAND_KEYWORDS = [
  "Mouni's Maguva",
  "Mounis Maguva",
  "Mounis MAGUVA",
  "MAGUVA",
  "Mounis Maguva Vijayawada",
  "ethnic wear Vijayawada",
  "sarees online India",
  "kurtis online",
  "three piece sets",
  "Indian ethnic wear",
];

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    alternateName: ["Mounis Maguva", "MAGUVA", "Mouni's MAGUVA"],
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    image: absoluteUrl("/og-image.png"),
    description: site.description,
    email: site.email,
    telephone: site.phone,
    sameAs: [site.instagram],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${SITE_URL}/#store`,
    name: site.name,
    alternateName: ["Mounis Maguva", "MAGUVA"],
    url: SITE_URL,
    image: absoluteUrl("/og-image.png"),
    description: site.description,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Benz Circle, beside Raj Darbar Restaurant",
      addressLocality: "Vijayawada",
      addressRegion: "Andhra Pradesh",
      addressCountry: "IN",
    },
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Bank Transfer",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.name,
    alternateName: ["Mounis Maguva", "MAGUVA"],
    url: SITE_URL,
    description: site.description,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-IN",
  };
}

export const rootMetadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: `${site.name} | Mounis Maguva — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: BRAND_KEYWORDS,
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  publisher: site.name,
  category: "shopping",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: SITE_URL,
    siteName: site.name,
    title: `${site.name} | Mounis Maguva`,
    description: site.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Mounis Maguva`,
    description: site.description,
    images: ["/og-image.png"],
  },
};

export const homeMetadata = {
  title: `${site.name} | Mounis Maguva — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} | Mounis Maguva`,
    description: site.description,
    url: "/",
  },
};

export const STATIC_SITEMAP_ROUTES = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/track", changeFrequency: "monthly", priority: 0.5 },
  { path: "/instagram", changeFrequency: "weekly", priority: 0.6 },
  ...categories.map((cat) => ({
    path: `/shop/${cat.slug}`,
    changeFrequency: "daily",
    priority: 0.85,
  })),
];
