import { revalidatePath, revalidateTag } from "next/cache";
import { categories } from "@/lib/site";

export const PRODUCTS_CACHE_TAG = "products";

/** Refresh storefront pages after admin catalog changes. */
export function revalidateStorefront(productSlug) {
  revalidateTag(PRODUCTS_CACHE_TAG, "max");

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");

  for (const category of categories) {
    revalidatePath(`/shop/${category.slug}`);
  }

  if (productSlug) {
    revalidatePath(`/product/${productSlug}`);
  }
}
