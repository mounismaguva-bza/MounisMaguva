import { getAllProductImages } from "@/lib/product-images";
import { warmImages } from "@/lib/image-cache";
import { readLocalJson, writeLocalJson } from "@/lib/local-storage";

const CATALOG_KEY = "mm:product-catalog";
const CATALOG_TTL_MS = 60 * 60 * 1000;

/**
 * @typedef {{ products: import('./products').Product[]; savedAt: number }} CatalogCache
 */

function isFresh(cache) {
  return Boolean(cache?.savedAt && Date.now() - cache.savedAt < CATALOG_TTL_MS);
}

/** @returns {import('./products').Product[] | null} */
export function getCachedProducts() {
  const cache = readLocalJson(CATALOG_KEY, null);
  if (!cache || !Array.isArray(cache.products) || !cache.products.length) {
    return null;
  }
  if (!isFresh(cache)) return null;
  return cache.products;
}

/** @param {import('./products').Product[]} products */
export function setCachedProducts(products) {
  if (!Array.isArray(products) || !products.length) return;

  writeLocalJson(CATALOG_KEY, {
    products,
    savedAt: Date.now(),
  });
}

/** @param {import('./products').Product[]} products */
export function cacheProductsAndWarmImages(products) {
  if (!Array.isArray(products) || !products.length) return;

  setCachedProducts(products);

  const imageUrls = products.flatMap((product) => getAllProductImages(product));
  warmImages(imageUrls);
}
