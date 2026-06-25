import { getAllProductImages, getProductThumbnail } from "@/lib/product-images";
import { warmImages } from "@/lib/image-cache";
import { runInIdleBatches } from "@/lib/background-task";
import { readLocalJson, writeLocalJson } from "@/lib/local-storage";

export const CATALOG_KEY = "mm:product-catalog";
export const CACHE_META_KEY = "mm:cache-meta";
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

function toLiteProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    category: product.category,
    updatedAt: product.updatedAt ?? null,
    thumbnail: getProductThumbnail(product),
    isNew: Boolean(product.isNew),
    isBestSeller: Boolean(product.isBestSeller),
  };
}

function writeCacheMeta(count) {
  writeLocalJson(CACHE_META_KEY, {
    savedAt: Date.now(),
    count,
    path: typeof window !== "undefined" ? window.location.pathname : "",
  });
}

/** @param {import('./products').Product[]} products */
export function setCachedProducts(products) {
  if (!Array.isArray(products) || !products.length) return;

  const payload = {
    products,
    savedAt: Date.now(),
    count: products.length,
  };

  const saved = writeLocalJson(CATALOG_KEY, payload);
  if (!saved) {
    writeLocalJson(CATALOG_KEY, {
      products: products.map(toLiteProduct),
      savedAt: Date.now(),
      count: products.length,
      lite: true,
    });
  }

  writeCacheMeta(products.length);
}

/** @param {import('./products').Product[]} products */
export function cacheProductsAndWarmImages(products) {
  if (!Array.isArray(products) || !products.length) return;

  setCachedProducts(products);

  const imageUrls = products.flatMap((product) => getAllProductImages(product));
  warmImages(imageUrls);
}

/** Non-blocking: save catalog + prefetch images during browser idle time. */
export function cacheProductsInBackground(products) {
  if (!Array.isArray(products) || !products.length) return () => {};

  return runInIdleBatches(
    products,
    (product) => {
      warmImages(getAllProductImages(product));
    },
    { batchSize: 2 },
  );
}
