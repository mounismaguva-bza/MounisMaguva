import { collectionImages, fashionImages } from "./images";

/** @typedef {'sarees' | 'three-piece-sets' | 'dresses' | 'Frock' | 'dupattas' | 'new-arrivals'} CategorySlug */

export const site = {
  name: "Mouni's Maguva",
  brandLine: "mounis",
  brandName: "MAGUVA",
  tagline: "Style for Every Occasion",
  description:
    "Discover handpicked sarees, 3 piece sets, dresses and Frock. Curated ethnic wear with timeless Indian craftsmanship.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.mounismaguva.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919491080899",
  instagram: "https://www.instagram.com/maguva_ethinics",
  instagramHandle: "@maguva_ethinics",
  email: "hello@maguvaethnics.com",
  phone: "+91 94910 80899",
  address:
    "Benz Circle, beside Raj Darbar Restaurant, Vijayawada, Andhra Pradesh, India",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9098.737227768355!2d80.65161887715695!3d16.498421621224598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35fb35e9adbd3f%3A0x8185a8644450104a!2sMounis%20Maguva!5e0!3m2!1sen!2sin!4v1779344327241!5m2!1sen!2sin",
  currency: "INR",
  locale: "en-IN",
};

export const announcements = [
  "Free shipping on all orders across India",
  "WhatsApp us for international shipping",
  "24/7 customer support on WhatsApp",
];

/** Featured category promos for homepage banner grid */
export const categoryPromos = [
  {
    slug: "sarees",
    href: "/shop/sarees",
    discount: "Get Upto 20% off",
    title: "Women's Latest Saree Collection",
    image: fashionImages.sareeRed,
    layout: "horizontal",
  },
  {
    slug: "Frock",
    href: "/shop/Frock",
    discount: "Get Upto 20% off",
    title: "Women's Latest Kurti Collection",
    image: fashionImages.kurtiIndigo,
    layout: "horizontal",
  },
  {
    slug: "three-piece-sets",
    href: "/shop/three-piece-sets",
    discount: "Get Upto 20% off",
    title: "3 Pices Sets for Every Occasion",
    image: collectionImages.threePieceSets,
    layout: "featured",
  },
];

export const categories = [
  {
    slug: "sarees",
    name: "Sarees",
    description: "Silk, cotton & designer drapes",
    image: collectionImages.festiveSarees,
    count: 48,
  },
  {
    slug: "three-piece-sets",
    name: "3 Pices Sets",
    description: "Ready-to-wear 3 piece outfits",
    image: collectionImages.threePieceSets,
    count: 18,
  },
  {
    slug: "dresses",
    name: "Dresses",
    description: "Indo-western & ethnic gowns",
    image: collectionImages.indoWestern,
    count: 23,
  },
  {
    slug: "Frock",
    name: "Frock",
    description: "Everyday elegance",
    image: collectionImages.dailyFrock,
    count: 32,
  },
  {
    slug: "dupattas",
    name: "Dupattas",
    description: "Complete your look",
    image: collectionImages.dupatta,
    count: 15,
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "Fresh from our studio",
    image: collectionImages.newArrivals,
    count: 12,
  },
];

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/track", label: "Track Order" },
  // { href: "/instagram", label: "Instagram" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];
