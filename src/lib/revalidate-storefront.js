import { revalidatePath } from "next/cache";
import { categories } from "@/lib/site";

/** Refresh storefront pages after admin catalog changes. */
export function revalidateStorefront(productSlug) {
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
