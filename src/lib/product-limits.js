import "server-only";

import { MAX_PRODUCTS } from "@/lib/constants";
import { COLLECTIONS, listCollection } from "@/lib/firestore";

export { MAX_PRODUCTS };

export async function getStoredProductCount() {
  try {
    const products = await listCollection(COLLECTIONS.products);
    return products.length;
  } catch {
    return 0;
  }
}

export async function canAddProduct() {
  const count = await getStoredProductCount();
  return count < MAX_PRODUCTS;
}
