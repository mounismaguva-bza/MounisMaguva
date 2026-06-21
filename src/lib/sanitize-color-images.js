import { MAX_IMAGES_PER_COLOR } from "@/lib/constants";
import { normalizeProductImageSrc } from "@/lib/product-images";

/** Keep only valid remote image URLs (e.g. Cloudinary), max per color. */
export function sanitizeColorImages(colorImages = {}) {
  if (!colorImages || typeof colorImages !== "object" || Array.isArray(colorImages)) {
    return {};
  }

  const next = {};
  Object.entries(colorImages).forEach(([color, urls]) => {
    const list = Array.isArray(urls) ? urls : [];
    const valid = list
      .map((url) => normalizeProductImageSrc(url, null))
      .filter((url) => url && /^https?:\/\//i.test(url));
    if (valid.length) {
      next[color] = [...new Set(valid)].slice(0, MAX_IMAGES_PER_COLOR);
    }
  });
  return next;
}

/**
 * @param {Record<string, string[]>} colorImages
 * @param {string[]} colors
 * @returns {string | null} Error message or null if valid
 */
export function validateColorImages(colorImages, colors = []) {
  for (const color of colors) {
    const count = colorImages[color]?.length || 0;
    if (count === 0) {
      return `Upload at least one image for "${color}".`;
    }
    if (count > MAX_IMAGES_PER_COLOR) {
      return `"${color}" can have at most ${MAX_IMAGES_PER_COLOR} photos.`;
    }
  }
  return null;
}
