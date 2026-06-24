import { categories, site } from "./site";

/** Canonical production URL — used for sitemap, canonical tags, and JSON-LD */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mounismaguva.com").replace(
  /\/$/,
  "",
);

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const STORE_ID = `${SITE_URL}/#store`;
const HOME_PAGE_ID = `${SITE_URL}/#webpage`;

export const BRAND_KEYWORDS = [
  "Mouni's Maguva",
  "Mounis Maguva",
  "Mounis MAGUVA",
  "MAGUVA",
  "Maguva Ethnics",
  "maguva_ethinics",
  "Mounis Maguva Vijayawada",
  "best ethnic wear online India",
  "best sarees online Vijayawada",
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

function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    alternateName: [
      "Mounis Maguva",
      "MAGUVA",
      "Mouni's MAGUVA",
      "Maguva Ethnics",
      "maguva_ethinics",
      "@maguva_ethinics",
    ],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon.png"),
      width: 512,
      height: 512,
    },
    image: absoluteUrl("/og-image.png"),
    description: site.description,
    email: site.email,
    telephone: site.phone,
    sameAs: [site.instagram],
  };
}

function localBusinessNode() {
  return {
    "@type": "ClothingStore",
    "@id": STORE_ID,
    name: site.name,
    alternateName: ["Mounis Maguva", "MAGUVA", "Maguva Ethnics"],
    url: SITE_URL,
    image: absoluteUrl("/og-image.png"),
    description: site.description,
    telephone: site.phone,
    email: site.email,
    parentOrganization: { "@id": ORG_ID },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Benz Circle, beside Raj Darbar Restaurant",
      addressLocality: "Vijayawada",
      addressRegion: "Andhra Pradesh",
      postalCode: "520010",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 16.498421621224598,
      longitude: 80.65161887715695,
    },
    hasMap:
      "https://www.google.com/maps/place/Mounis+Maguva/@16.4984216,80.6516189,17z",
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Bank Transfer",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    sameAs: [site.instagram],
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    alternateName: ["Mounis Maguva", "MAGUVA", "Best Ethnic Wear Vijayawada"],
    url: SITE_URL,
    description: site.description,
    publisher: { "@id": ORG_ID },
    copyrightHolder: { "@id": ORG_ID },
    inLanguage: "en-IN",
  };
}

function homeWebPageNode() {
  return {
    "@type": "WebPage",
    "@id": HOME_PAGE_ID,
    url: absoluteUrl("/"),
    name: `Best Ethnic Wear Online — ${site.name}`,
    description: site.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    mainEntity: { "@id": STORE_ID },
    primaryImageOfPage: absoluteUrl("/og-image.png"),
    inLanguage: "en-IN",
  };
}

/** Unified structured data graph for Google brand / local results */
export function brandJsonLdGraph({ includeHomePage = false } = {}) {
  const graph = [organizationNode(), websiteNode(), localBusinessNode()];
  if (includeHomePage) graph.push(homeWebPageNode());
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/** @deprecated Use brandJsonLdGraph() — kept for imports that still reference these */
export function organizationJsonLd() {
  return { "@context": "https://schema.org", ...organizationNode() };
}

export function localBusinessJsonLd() {
  return { "@context": "https://schema.org", ...localBusinessNode() };
}

export function websiteJsonLd() {
  return { "@context": "https://schema.org", ...websiteNode() };
}

export function homeWebPageJsonLd() {
  return { "@context": "https://schema.org", ...homeWebPageNode() };
}

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const rootMetadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: `Best Sarees & Ethnic Wear Online | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description: `${site.description} Shop the best sarees, kurtis and three-piece sets from ${site.name} in Vijayawada, India.`,
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
  ...(googleVerification
    ? {
        verification: {
          google: googleVerification,
        },
      }
    : {}),
  openGraph: {
    type: "website",
    locale: site.locale,
    url: SITE_URL,
    siteName: site.name,
    title: `Best Sarees & Ethnic Wear Online | ${site.name}`,
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
    title: `Best Ethnic Wear Online | ${site.name}`,
    description: site.description,
    images: ["/og-image.png"],
  },
};

export const homeMetadata = {
  title: `Best Ethnic Wear Online — Sarees, Kurtis & 3 Piece Sets`,
  description: `Shop the best sarees, three-piece sets, dresses and kurtis at ${site.name}. ${site.tagline}. Free shipping across India. Vijayawada, Andhra Pradesh.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: `Best Ethnic Wear Online — Sarees, Kurtis & 3 Piece Sets | ${site.name}`,
    description: `Discover handpicked ethnic wear — the best sarees, kurtis and 3 piece sets from ${site.name}.`,
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
  ...categories.map((cat) => ({
    path: `/shop/${cat.slug}`,
    changeFrequency: "daily",
    priority: 0.85,
  })),
];
