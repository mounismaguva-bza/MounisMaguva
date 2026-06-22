import { MAX_IMAGES_PER_COLOR } from "@/lib/constants";
import { brandLogo } from "@/lib/images";
import { site } from "@/lib/site";

/**
 * Images linked to product colors.
 * @typedef {Record<string, string[]>} ColorImagesMap
 */

export const PRODUCT_IMAGE_FALLBACK = brandLogo;
const FALLBACK_THUMBNAIL = PRODUCT_IMAGE_FALLBACK;

function cleanImageUrl(value) {
  if (value == null) return "";
  return typeof value === "string" ? value.trim() : String(value).trim();
}

function cleanImageList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(cleanImageUrl).filter(Boolean);
}

/** Encode spaces in local public paths so Next.js Image can build a valid URL */
function encodeLocalImagePath(path) {
  const segments = path.split("/").filter(Boolean);
  if (!segments.length) return "";
  try {
    return `/${segments.map((segment) => encodeURIComponent(decodeURIComponent(segment))).join("/")}`;
  } catch {
    return `/${segments.map(encodeURIComponent).join("/")}`;
  }
}

/**
 * Returns a src safe for next/image, or fallback when invalid.
 * @param {string | null | undefined} src
 * @param {string | null} [fallback]
 */
export function normalizeProductImageSrc(src, fallback = FALLBACK_THUMBNAIL) {
  const trimmed = cleanImageUrl(src);
  if (!trimmed) return fallback;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).toString();
    } catch {
      return fallback;
    }
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  try {
    new URL(path, "http://localhost");
  } catch {
    return fallback;
  }

  return encodeLocalImagePath(path);
}

/** Full HTTPS URL for next/image and absolute resolution */
export function resolveAbsoluteProductImageUrl(src, origin) {
  const normalized = normalizeProductImageSrc(src, null);
  if (!normalized) return "";

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : site.url);

  try {
    return new URL(normalized, base).toString();
  } catch {
    return "";
  }
}

const CLOUDINARY_UPLOAD = "/image/upload/";

/**
 * Hybrid delivery variants.
 * - Original master stays untouched on Cloudinary.
 * - Each screen gets a right-sized, high-quality WebP copy.
 * - `c_limit` only scales down (never crops), so the full image is always shown.
 * @type {Record<string, string>}
 */
const CLOUDINARY_VARIANTS = {
  thumb: "f_webp,q_80,w_160,c_limit",
  card: "f_webp,q_88,w_900,c_limit",
  full: "f_webp,q_92,w_2000,c_limit",
  zoom: "f_webp,q_95,w_2600,c_limit",
};

function isCloudinaryTransformSegment(segment) {
  if (!segment || /^v\d+$/.test(segment)) return false;
  return segment.includes("_") || segment.includes(":") || segment.includes(",");
}

/** Strip existing delivery transforms so we can apply the right size variant. */
function getCloudinaryAssetPath(url) {
  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD);
  if (markerIndex === -1) return null;

  const segments = url.slice(markerIndex + CLOUDINARY_UPLOAD.length).split("/");
  while (segments.length && isCloudinaryTransformSegment(segments[0])) {
    segments.shift();
  }

  return segments.length ? segments.join("/") : null;
}

/** @param {string} url */
export function isCloudinaryUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "res.cloudinary.com" || host.endsWith(".cloudinary.com");
  } catch {
    return false;
  }
}

/**
 * Optimized Cloudinary delivery URL (not the raw upload/source link).
 * @param {string} url
 * @param {"thumb" | "card" | "full" | "zoom" | "original"} [variant]
 */
export function toCloudinaryDeliveryUrl(url, variant = "full") {
  if (!url || !isCloudinaryUrl(url)) return url;

  const assetPath = getCloudinaryAssetPath(url);
  if (!assetPath) return url;

  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD);
  const before = url.slice(0, markerIndex + CLOUDINARY_UPLOAD.length);

  // Untouched original master (no delivery transforms).
  if (variant === "original") {
    return `${before}${assetPath}`;
  }

  const transforms = CLOUDINARY_VARIANTS[variant] || CLOUDINARY_VARIANTS.full;
  return `${before}${transforms}/${assetPath}`;
}

/** @param {string} slug @param {string} [origin] */
export function getProductPageUrl(slug, origin) {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : site.url);
  try {
    return new URL(`/product/${slug}`, base).toString();
  } catch {
    return "";
  }
}

/**
 * What to put in WhatsApp message text — product page link, never raw Cloudinary source.
 * @param {string | null | undefined} imageSrc
 * @param {{ slug?: string; origin?: string }} [options]
 */
export function getWhatsAppImageReference(imageSrc, options = {}) {
  const { slug, origin } = options;

  if (slug) {
    return getProductPageUrl(slug, origin);
  }

  const absolute = resolveAbsoluteProductImageUrl(imageSrc, origin);
  if (!absolute) return "";

  if (isCloudinaryUrl(absolute)) {
    return toCloudinaryDeliveryUrl(absolute);
  }

  return absolute;
}

/** URL to fetch when copying an image for WhatsApp paste */
export function resolveWhatsAppImageFetchUrl(imageSrc, origin) {
  const absolute = resolveAbsoluteProductImageUrl(imageSrc, origin);
  if (!absolute) return "";

  if (isCloudinaryUrl(absolute)) {
    return toCloudinaryDeliveryUrl(absolute);
  }

  return absolute;
}

function normalizeImageList(list) {
  return cleanImageList(list)
    .map((url) => normalizeProductImageSrc(url, null))
    .filter(Boolean);
}

/** @param {import('./products').Product} product */
export function getColorImagesMap(product) {
  if (product?.colorImages && typeof product.colorImages === "object") {
    return product.colorImages;
  }
  const colors = product?.colors?.length
    ? product.colors
    : product?.color
      ? [product.color]
      : [];
  const legacy = cleanImageList(product?.images);
  if (colors.length && legacy.length) {
    return { [colors[0]]: legacy };
  }
  return {};
}

/**
 * @param {import('./products').Product} product
 * @param {string} [colorLabel]
 */
export function getImagesForColor(product, colorLabel) {
  const map = getColorImagesMap(product);
  if (colorLabel && map[colorLabel]?.length) {
    return normalizeImageList(map[colorLabel]);
  }
  const colors = product?.colors || [];
  if (colors[0] && map[colors[0]]?.length) {
    return normalizeImageList(map[colors[0]]);
  }
  const flat = normalizeImageList(Object.values(map).flat());
  if (flat.length) return flat;
  return normalizeImageList(product?.images);
}

/** First image for cards and listings */
export function getProductThumbnail(product) {
  const images = getImagesForColor(product, product?.colors?.[0] || product?.color);
  for (const image of images) {
    const normalized = normalizeProductImageSrc(image, null);
    if (normalized) return normalized;
  }
  return normalizeProductImageSrc(PRODUCT_IMAGE_FALLBACK);
}

export function hasProductImages(product) {
  return getAllProductImages(product).length > 0;
}

export function isProductImageFallback(src) {
  const normalized = normalizeProductImageSrc(src, null);
  if (!normalized) return true;
  return normalized === normalizeProductImageSrc(PRODUCT_IMAGE_FALLBACK);
}

/** Primary + next image for listing hover swap */
export function getProductCardImages(product) {
  const images = getAllProductImages(product);
  const primary = images[0] || getProductThumbnail(product);
  const hover =
    images.length > 1 && images[1] !== primary ? images[1] : null;
  return { primary, hover };
}

/** All unique images across colors (for SEO / fallback) */
export function getAllProductImages(product) {
  const map = getColorImagesMap(product);
  const fromMap = normalizeImageList(Object.values(map).flat());
  const unique = [...new Set(fromMap)];
  if (unique.length) return unique;
  return normalizeImageList(product?.images);
}

/**
 * @param {ColorImagesMap} colorImages
 * @param {string[]} colors
 */
export function pruneColorImages(colorImages, colors) {
  const next = {};
  colors.forEach((color) => {
    if (colorImages[color]?.length) {
      next[color] = colorImages[color].slice(0, MAX_IMAGES_PER_COLOR);
    }
  });
  return next;
}

/**
 * @param {unknown} raw
 * @param {string[]} colors
 */
export function normalizeColorImagesPayload(raw, colors = []) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const map = {};
    Object.entries(raw).forEach(([key, urls]) => {
      const k = String(key).trim();
      if (!k) return;
      const list = Array.isArray(urls)
        ? urls.map((u) => String(u).trim()).filter(Boolean)
        : String(urls || "")
            .split(",")
            .map((u) => u.trim())
            .filter(Boolean);
      if (list.length) map[k] = list;
    });
    return pruneColorImages(map, colors.length ? colors : Object.keys(map));
  }
  return {};
}
