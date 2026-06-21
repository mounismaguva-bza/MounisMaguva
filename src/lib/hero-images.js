/**
 * Hero carousel images from public/hero/
 * Recommended for 4K displays: 3840 × 1920 px (2:1) PNG or WebP
 *
 * @typedef {{ src: string; alt: string; width: number; height: number; href?: string; objectPosition?: string }} HeroImage
 */

/** @type {HeroImage[]} */
export const heroImages = [
  {
    src: "/hero/h1.png",
    alt: "Mouni's Maguva — ethnic wear collection",
    width: 1774,
    height: 887,
    href: "/shop",
  },
  {
    src: "/hero/he2.png",
    alt: "Mouni's Maguva — festive sarees and sets",
    width: 1536,
    height: 1024,
    href: "/shop",
    objectPosition: "center 10%",
  },
  {
    src: "/hero/h3.png",
    alt: "Mouni's Maguva — ethnic wear collection",
    width: 1536,
    height: 1024,
    href: "/shop",
    objectPosition: "center 5%",
  },
];

export const HERO_RECOMMENDED_SIZE = { width: 3840, height: 1920 };
/** Use the same 2:1 ratio for all hero images to avoid edge crop in the fixed banner. */
