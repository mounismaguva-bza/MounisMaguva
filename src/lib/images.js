/** Base path for assets in public/Maguva Images (encoded for next/image) */
const MAGUVA_DIR = "/Maguva%20Images";

/** Store logo used when a product has no uploaded image */
export const brandLogo = "/Mounis Logo.png";

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

/** Local collection photos in public/Maguva Images */
export const collectionImages = {
  threePieceSets: `${MAGUVA_DIR}/im1.jpeg`,
  festiveSarees: `${MAGUVA_DIR}/im2.jpeg`,
  dailyFrock: `${MAGUVA_DIR}/im3.jpeg`,
  indoWestern: `${MAGUVA_DIR}/im4.jpeg`,
  dupatta: `${MAGUVA_DIR}/image4.jpg`,
  newArrivals: `${MAGUVA_DIR}/image26.jpg`,
  founder: `${MAGUVA_DIR}/mounika.png`,
};

/** Curated aliases used across hero, products, collections, and about */
export const fashionImages = {
  sareeRed: collectionImages.festiveSarees,
  sareeDrape: collectionImages.festiveSarees,
  sareeGold: collectionImages.threePieceSets,
  sareePink: collectionImages.indoWestern,
  sareeLavender: collectionImages.dailyFrock,
  lehengaBridal: collectionImages.threePieceSets,
  lehengaFestive: collectionImages.festiveSarees,
  lehengaParty: collectionImages.indoWestern,
  dressGown: collectionImages.indoWestern,
  dressAnarkali: collectionImages.indoWestern,
  kurtiIndigo: collectionImages.dailyFrock,
  kurtiPeach: collectionImages.dailyFrock,
  dupatta: collectionImages.dupatta,
  fashionEditorial: collectionImages.threePieceSets,
  hero: collectionImages.festiveSarees,
  collectionsBanner: collectionImages.newArrivals,
};
