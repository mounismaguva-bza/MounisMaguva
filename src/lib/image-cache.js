import {
  isCloudinaryUrl,
  normalizeProductImageSrc,
  toCloudinaryDeliveryUrl,
} from "@/lib/product-images";
import {
  readLocalStringSet,
  writeLocalStringSet,
} from "@/lib/local-storage";

const WARMED_IMAGES_KEY = "mm:warmed-images";
const MAX_WARMED_IMAGES = 400;

/** Stable Cloudinary delivery URL for display and caching. */
export function getDisplayImageSrc(src, fallback = "") {
  const normalized = normalizeProductImageSrc(src, fallback || null);
  if (!normalized) return fallback;
  if (isCloudinaryUrl(normalized)) {
    return toCloudinaryDeliveryUrl(normalized);
  }
  return normalized;
}

export function shouldBypassNextImageOptimizer(src) {
  return isCloudinaryUrl(getDisplayImageSrc(src, ""));
}

function getWarmedImages() {
  return readLocalStringSet(WARMED_IMAGES_KEY);
}

function markImageWarmed(url) {
  if (!url) return;

  const warmed = getWarmedImages();
  if (warmed.has(url)) return;

  warmed.add(url);

  if (warmed.size > MAX_WARMED_IMAGES) {
    const trimmed = [...warmed].slice(-MAX_WARMED_IMAGES);
    warmed.clear();
    trimmed.forEach((entry) => warmed.add(entry));
  }

  writeLocalStringSet(WARMED_IMAGES_KEY, warmed);
}

/** Prefetch an image once (tracked in localStorage) to warm the HTTP cache. */
export function warmImage(src) {
  if (typeof window === "undefined") return;

  const url = getDisplayImageSrc(src, "");
  if (!url) return;

  const warmed = getWarmedImages();
  if (warmed.has(url)) return;

  const img = new window.Image();
  img.decoding = "async";
  img.onload = () => markImageWarmed(url);
  img.onerror = () => markImageWarmed(url);
  img.src = url;
}

export function warmImages(urls) {
  if (!Array.isArray(urls)) return;
  const unique = [
    ...new Set(urls.map((url) => getDisplayImageSrc(url, "")).filter(Boolean)),
  ];
  unique.forEach(warmImage);
}

export function isImageWarmed(src) {
  const url = getDisplayImageSrc(src, "");
  return url ? getWarmedImages().has(url) : false;
}
