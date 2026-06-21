/** Base path for assets in public/Maguva Images (encoded for next/image) */
const MAGUVA_DIR = "/Maguva%20Images";

/**
 * Local Maguva product & marketing image (image1.jpg … image27.jpg, image15.png).
 * @param {number} index 1–27
 */
export function maguvaImage(index) {
  const ext = index === 15 ? "png" : "jpg";
  return `${MAGUVA_DIR}/image${index}.${ext}`;
}

/** All 27 Maguva images — useful for galleries and Instagram fallbacks */
export const maguvaGallery = Array.from({ length: 27 }, (_, i) =>
  maguvaImage(i + 1),
);

/** Curated aliases used across hero, products, collections, and about */
export const fashionImages = {
  sareeRed: maguvaImage(1),
  sareeDrape: maguvaImage(2),
  sareeGold: maguvaImage(3),
  sareePink: maguvaImage(4),
  sareeLavender: maguvaImage(5),
  lehengaBridal: maguvaImage(6),
  lehengaFestive: maguvaImage(7),
  lehengaParty: maguvaImage(8),
  dressGown: maguvaImage(9),
  dressAnarkali: maguvaImage(10),
  kurtiIndigo: maguvaImage(11),
  kurtiPeach: maguvaImage(12),
  dupatta: maguvaImage(13),
  fashionEditorial: maguvaImage(14),
  hero: maguvaImage(1),
  collectionsBanner: maguvaImage(16),
};
