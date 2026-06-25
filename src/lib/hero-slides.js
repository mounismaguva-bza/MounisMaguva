import "server-only";

import { fashionImages } from "@/lib/images";
import { COLLECTIONS, listCollection } from "@/lib/firestore";
import { getImageOverrideMap } from "@/lib/media-overrides";
import { normalizeProductImageSrc } from "@/lib/product-images";

/** @typedef {{ title: string; description: string; cta: { label: string; href: string }; image: string; alt: string }} HeroSlide */

export const DEFAULT_HERO_SLIDES = [
  {
    title: "Timeless elegance for every celebration",
    description:
      "Handpicked sarees, 3 piece sets and Frock — curated for weddings, festivals and everyday grace.",
    ctaLabel: "Shop collection",
    ctaHref: "/shop",
    imageKey: "fashionImages.sareeRed",
    image: fashionImages.sareeRed,
    alt: "Ethnic saree collection",
    sortOrder: 1,
  },
  {
    title: "3 piece sets that turn every head",
    description:
      "Co-ord kurta sets with dupatta — made for your most unforgettable day.",
    ctaLabel: "Shop 3 piece sets",
    ctaHref: "/shop/three-piece-sets",
    imageKey: "fashionImages.lehengaBridal",
    image: fashionImages.lehengaBridal,
    alt: "3 piece set",
    sortOrder: 2,
  },
  {
    title: "Festive looks for every occasion",
    description:
      "Light drapes and bold colours — ready for sangeet, puja and party nights.",
    ctaLabel: "Shop sarees",
    ctaHref: "/shop/sarees",
    imageKey: "fashionImages.sareePink",
    image: fashionImages.sareePink,
    alt: "Festive saree",
    sortOrder: 3,
  },
  {
    title: "Everyday Frock, effortlessly beautiful",
    description:
      "Soft cotton and rayon — comfort you can wear from morning to evening.",
    ctaLabel: "Shop Frock",
    ctaHref: "/shop/Frock",
    imageKey: "fashionImages.kurtiPeach",
    image: fashionImages.kurtiPeach,
    alt: "Kurti collection",
    sortOrder: 4,
  },
];

/** @param {Record<string, unknown>} doc */
export function toHeroSlideView(doc) {
  const image = normalizeProductImageSrc(doc.image, null);
  if (!image || !doc.title) return null;

  return {
    id: doc.id,
    title: String(doc.title),
    description: String(doc.description || ""),
    cta: {
      label: String(doc.ctaLabel || "Shop collection"),
      href: String(doc.ctaHref || "/shop"),
    },
    image,
    alt: String(doc.alt || doc.title),
    sortOrder: Number(doc.sortOrder) || 0,
    active: doc.active !== false,
  };
}

async function getDefaultHeroSlides() {
  const imageMap = await getImageOverrideMap();
  return DEFAULT_HERO_SLIDES.map((slide) => {
    const image =
      imageMap[slide.imageKey] ||
      normalizeProductImageSrc(slide.image, fashionImages.sareeRed);
    return {
      title: slide.title,
      description: slide.description,
      cta: { label: slide.ctaLabel, href: slide.ctaHref },
      image,
      alt: slide.alt,
    };
  });
}

/** @returns {Promise<HeroSlide[]>} */
export async function getHeroSlides() {
  try {
    const docs = await listCollection(COLLECTIONS.heroSlides, {
      orderBy: "sortOrder",
      direction: "asc",
    });
    const slides = docs
      .map(toHeroSlideView)
      .filter(Boolean)
      .filter((slide) => slide.active);

    if (slides.length) {
      return slides.map(({ title, description, cta, image, alt }) => ({
        title,
        description,
        cta,
        image,
        alt,
      }));
    }
  } catch {
    /* use defaults */
  }

  return getDefaultHeroSlides();
}
