/** Target ~100KB while keeping high visual quality (WebP, high quality first). */
export const IMAGE_UPLOAD_TARGET_BYTES = 100 * 1024;

const MAX_DIMENSION = 2400;
const START_QUALITY = 0.92;
const MIN_QUALITY = 0.78;

function stripExtension(name) {
  return String(name || "image").replace(/\.[^.]+$/, "") || "image";
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
      type,
      quality,
    );
  });
}

function fitDimensions(width, height, maxDim) {
  if (width <= maxDim && height <= maxDim) return { width, height };
  const scale = maxDim / Math.max(width, height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

async function tryCompressCanvas(canvas, baseName, targetBytes) {
  const types = [
    { type: "image/webp", ext: "webp" },
    { type: "image/jpeg", ext: "jpg" },
  ];

  for (const { type, ext } of types) {
    for (let quality = START_QUALITY; quality >= MIN_QUALITY; quality -= 0.02) {
      const blob = await canvasToBlob(canvas, type, quality);
      if (blob.size <= targetBytes) {
        return new File([blob], `${baseName}.${ext}`, { type, lastModified: Date.now() });
      }
    }
  }
  return null;
}

/**
 * Compress an image file to ~100KB using WebP/JPEG at high quality before upload.
 * @param {File | Blob} file
 * @param {number} [targetBytes]
 * @returns {Promise<File>}
 */
export async function compressImageForUpload(file, targetBytes = IMAGE_UPLOAD_TARGET_BYTES) {
  const image = await loadImageFromFile(file);
  const baseName = stripExtension(file instanceof File ? file.name : "image");

  let { width, height } = fitDimensions(image.naturalWidth, image.naturalHeight, MAX_DIMENSION);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const compressed = await tryCompressCanvas(canvas, baseName, targetBytes);
    if (compressed) return compressed;

    width = Math.round(width * 0.88);
    height = Math.round(height * 0.88);
    if (width < 480 || height < 480) break;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, "image/webp", MIN_QUALITY);
  return new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
}
