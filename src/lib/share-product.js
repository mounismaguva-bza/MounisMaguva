import { formatPrice } from "@/lib/format";
import { getProductPageUrl } from "@/lib/product-images";
import { site } from "@/lib/site";

export { getProductPageUrl };

/**
 * @param {{
 *   name: string;
 *   slug: string;
 *   sku: string;
 *   price: number;
 *   image?: string;
 *   colorLabel?: string;
 * }} product
 */
export function buildProductShareText(product) {
  const colorPart = product.colorLabel ? ` (${product.colorLabel})` : "";
  return [
    `${product.name}${colorPart}`,
    `SKU: ${product.sku}`,
    `Price: ${formatPrice(product.price)}`,
    `From ${site.name}`,
  ].join("\n");
}

/**
 * Share product link via native share sheet or clipboard.
 * @param {{
 *   name: string;
 *   slug: string;
 *   sku: string;
 *   price: number;
 *   image?: string;
 *   colorLabel?: string;
 * }} product
 * @returns {Promise<"shared" | "copied" | "cancelled" | "failed">}
 */
export async function shareProduct(product) {
  if (typeof window === "undefined") return "failed";

  const url = getProductPageUrl(product.slug);
  const text = buildProductShareText(product);
  const title = `${product.name} | ${site.name}`;

  const sharePayload = {
    title,
    text,
    url,
  };

  if (navigator.share) {
    try {
      const canShare =
        typeof navigator.canShare === "function"
          ? navigator.canShare(sharePayload)
          : true;

      if (canShare) {
        await navigator.share(sharePayload);
        return "shared";
      }
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
    }
  }

  const copyText = `${text}\n\n${url}`;

  try {
    await navigator.clipboard.writeText(copyText);
    return "copied";
  } catch {
    window.prompt("Copy this product link:", url);
    return "failed";
  }
}
