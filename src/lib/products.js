import { MAX_PRODUCTS } from "./constants";
import { COLLECTIONS, listCollection } from "@/lib/firestore";

/** @typedef {import('./site').CategorySlug} CategorySlug */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} sku
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} [originalPrice]
 * @property {CategorySlug} category
 * @property {string[]} images
 * @property {string} fabric
 * @property {string} color
 * @property {string[]} sizes
 * @property {boolean} isNew
 * @property {boolean} isBestSeller
 * @property {boolean} inStock
 * @property {string[]} tags
 * @property {string} [blouse]
 * @property {import('./product-details').ColorOption[]} [colorOptions]
 */

async function getFirestoreProducts() {
  try {
    const docs = await listCollection(COLLECTIONS.products, {
      orderBy: "updatedAt",
      direction: "desc",
    });
    if (!docs.length) return [];
    return docs;
  } catch {
    return [];
  }
}

export async function getAllProducts() {
  const firestoreProducts = await getFirestoreProducts();
  return firestoreProducts.slice(0, MAX_PRODUCTS);
}

/**
 * @param {string} slug
 * @returns {Product | undefined}
 */
export async function getProductBySlug(slug) {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug);
}

/**
 * @param {CategorySlug | 'all'} category
 * @returns {Product[]}
 */
export async function getProductsByCategory(category) {
  const all = await getAllProducts();
  if (category === "all" || category === "new-arrivals") {
    if (category === "new-arrivals") {
      return all.filter((p) => p.isNew);
    }
    return all;
  }
  return all.filter((p) => p.category === category);
}

export async function getNewArrivals(limit = 8) {
  const all = await getAllProducts();
  return all.filter((p) => p.isNew).slice(0, limit);
}

export async function getBestSellers(limit = 8) {
  const all = await getAllProducts();
  return all.filter((p) => p.isBestSeller).slice(0, limit);
}

export async function getRelatedProducts(product, limit = 4) {
  const all = await getAllProducts();
  return all
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}
