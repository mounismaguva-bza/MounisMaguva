import { COLLECTIONS, listCollection } from "@/lib/firestore";
import { fashionImages } from "@/lib/images";

export const IMAGE_ALIASES = [
  "fashionImages.sareeRed",
  "fashionImages.sareeDrape",
  "fashionImages.sareeGold",
  "fashionImages.sareePink",
  "fashionImages.sareeLavender",
  "fashionImages.lehengaBridal",
  "fashionImages.lehengaFestive",
  "fashionImages.lehengaParty",
  "fashionImages.dressGown",
  "fashionImages.dressAnarkali",
  "fashionImages.kurtiIndigo",
  "fashionImages.kurtiPeach",
  "fashionImages.dupatta",
  "fashionImages.fashionEditorial",
  "fashionImages.hero",
  "fashionImages.collectionsBanner",
];

const fallbackByAlias = {
  "fashionImages.sareeRed": fashionImages.sareeRed,
  "fashionImages.sareeDrape": fashionImages.sareeDrape,
  "fashionImages.sareeGold": fashionImages.sareeGold,
  "fashionImages.sareePink": fashionImages.sareePink,
  "fashionImages.sareeLavender": fashionImages.sareeLavender,
  "fashionImages.lehengaBridal": fashionImages.lehengaBridal,
  "fashionImages.lehengaFestive": fashionImages.lehengaFestive,
  "fashionImages.lehengaParty": fashionImages.lehengaParty,
  "fashionImages.dressGown": fashionImages.dressGown,
  "fashionImages.dressAnarkali": fashionImages.dressAnarkali,
  "fashionImages.kurtiIndigo": fashionImages.kurtiIndigo,
  "fashionImages.kurtiPeach": fashionImages.kurtiPeach,
  "fashionImages.dupatta": fashionImages.dupatta,
  "fashionImages.fashionEditorial": fashionImages.fashionEditorial,
  "fashionImages.hero": fashionImages.hero,
  "fashionImages.collectionsBanner": fashionImages.collectionsBanner,
};

export async function getImageOverrideMap() {
  try {
    const overrides = await listCollection(COLLECTIONS.mediaOverrides, {
      orderBy: "updatedAt",
      direction: "desc",
    });
    const map = { ...fallbackByAlias };
    overrides.forEach((item) => {
      if (item.alias && item.url) {
        map[item.alias] = item.url;
      }
    });
    return map;
  } catch {
    return { ...fallbackByAlias };
  }
}

export async function getImageByAlias(alias) {
  const map = await getImageOverrideMap();
  return map[alias] || "";
}
