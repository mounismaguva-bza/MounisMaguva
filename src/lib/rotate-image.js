import { resolveAbsoluteProductImageUrl } from "@/lib/product-images";

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function canvasToWebpBlob(canvas, quality = 0.95) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image rotation failed"))),
      "image/webp",
      quality,
    );
  });
}

/**
 * Rotate an image element on canvas and return a WebP blob.
 * @param {HTMLImageElement} img
 * @param {number} degrees Clockwise degrees (90, 180, 270).
 */
export async function rotateImageElement(img, degrees = 90) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const normalized = ((degrees % 360) + 360) % 360;
  const swap = normalized === 90 || normalized === 270;

  canvas.width = swap ? height : width;
  canvas.height = swap ? width : height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((normalized * Math.PI) / 180);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);

  return canvasToWebpBlob(canvas);
}

/**
 * Fetch an image URL, rotate clockwise, and return a File ready for upload.
 * @param {string} url
 * @param {number} [degrees]
 * @param {string} [baseName]
 */
export async function rotateImageFromUrl(url, degrees = 90, baseName = "image") {
  const absolute = resolveAbsoluteProductImageUrl(url);
  if (!absolute) throw new Error("Invalid image URL");

  const response = await fetch(absolute);
  if (!response.ok) {
    throw new Error("Could not load image for rotation");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const img = await loadImageElement(objectUrl);
    const rotatedBlob = await rotateImageElement(img, degrees);
    const name = `${String(baseName).replace(/\.[^.]+$/, "") || "image"}.webp`;
    return new File([rotatedBlob], name, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
