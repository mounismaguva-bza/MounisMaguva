import { resolveWhatsAppImageFetchUrl } from "@/lib/product-images";

/**
 * Copy a product image to the clipboard so the customer can paste it in WhatsApp.
 * @param {string | null | undefined} imageSrc
 * @returns {Promise<boolean>}
 */
export async function copyProductImageToClipboard(imageSrc) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.write) {
    return false;
  }

  const url = resolveWhatsAppImageFetchUrl(imageSrc);
  if (!url) return false;

  try {
    const response = await fetch(url);
    if (!response.ok) return false;

    const blob = await response.blob();
    const type = blob.type?.startsWith("image/") ? blob.type : "image/png";

    await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy the first product photo for WhatsApp paste (runs in background).
 * @param {Array<string | null | undefined>} imageSources
 */
export async function copyProductImagesForWhatsApp(imageSources) {
  const unique = [...new Set(imageSources.map((src) => src).filter(Boolean))];
  if (!unique.length) {
    return { copied: 0, total: 0 };
  }

  const copied = (await copyProductImageToClipboard(unique[0])) ? 1 : 0;
  return { copied, total: unique.length };
}
