import { getAllProducts } from "@/lib/products";
import { absoluteUrl, STATIC_SITEMAP_ROUTES } from "@/lib/seo";

/** @returns {Promise<import('next').MetadataRoute.Sitemap>} */
export default async function sitemap() {
  const now = new Date();
  const staticEntries = STATIC_SITEMAP_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }));

  let productEntries = [];
  try {
    const products = await getAllProducts();
    productEntries = products.map((product) => ({
      url: absoluteUrl(`/product/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    productEntries = [];
  }

  return [...staticEntries, ...productEntries];
}
