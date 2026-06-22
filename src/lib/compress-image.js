/** Target upload size — files over this are compressed before upload. */
export const IMAGE_UPLOAD_TARGET_BYTES = 5 * 1024 * 1024;

/** Hard reject limit for very large source files. */
export const IMAGE_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;

const MAX_DIMENSION = 4000;
const MIN_DIMENSION = 1200;
/** High quality — visually matches original for product photos. */
const EXPORT_QUALITY = 0.95;

function stripExtension(name) {
  return String(name || "image").replace(/\.[^.]+$/, "") || "image";
}

function fileFromBlob(blob, name, type) {
  return new File([blob], name, { type, lastModified: Date.now() });
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
      (blob) => (blob ? resolve(blob) : reject(new Error("Image processing failed"))),
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

async function renderToWebP(image, width, height, quality = EXPORT_QUALITY) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  return canvasToBlob(canvas, "image/webp", quality);
}

/**
 * Hybrid upload prep:
 * - ≤ 5MB → original file unchanged
 * - > 5MB → resize only (no crop) at high quality until under 5MB
 * @param {File | Blob} file
 * @returns {Promise<File>}
 */
export async function compressImageForUpload(file) {
  if (!(file instanceof File) && !(file instanceof Blob)) {
    throw new Error("Invalid image file");
  }

  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    const maxMb = Math.round(IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024));
    throw new Error(
      `Image is too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum source size is ${maxMb}MB.`,
    );
  }

  if (file.size <= IMAGE_UPLOAD_TARGET_BYTES && file instanceof File) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const baseName = stripExtension(file instanceof File ? file.name : "image");

  let { width, height } = fitDimensions(
    image.naturalWidth,
    image.naturalHeight,
    MAX_DIMENSION,
  );

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const blob = await renderToWebP(image, width, height, EXPORT_QUALITY);
    if (blob.size <= IMAGE_UPLOAD_TARGET_BYTES) {
      return fileFromBlob(blob, `${baseName}.webp`, "image/webp");
    }

    if (width <= MIN_DIMENSION || height <= MIN_DIMENSION) break;

    width = Math.round(width * 0.9);
    height = Math.round(height * 0.9);
  }

  const blob = await renderToWebP(
    image,
    Math.max(width, MIN_DIMENSION),
    Math.max(height, MIN_DIMENSION),
    EXPORT_QUALITY,
  );

  if (blob.size > IMAGE_UPLOAD_TARGET_BYTES) {
    throw new Error(
      "Could not reduce this image under 5MB while keeping quality. Try a slightly smaller photo.",
    );
  }

  return fileFromBlob(blob, `${baseName}.webp`, "image/webp");
}
