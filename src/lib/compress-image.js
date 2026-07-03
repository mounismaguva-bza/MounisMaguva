/** Target upload size — files over this are compressed before upload. */
export const IMAGE_UPLOAD_TARGET_BYTES = 5 * 1024 * 1024;

/** Hard reject limit for very large source files. */
export const IMAGE_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;

/** File input accept list — includes HEIC/HEIF from iPhone cameras. */
export const IMAGE_UPLOAD_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,.heic,.heif";

export function isHeicFile(file) {
  const name = (file instanceof File ? file.name : "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export function isAcceptedImageFile(file) {
  if (!(file instanceof File) && !(file instanceof Blob)) return false;
  if (isHeicFile(file)) return true;
  return (file.type || "").startsWith("image/");
}

async function convertHeicToJpegBlob(file) {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  if (!blob) throw new Error("Could not convert HEIC image");
  return blob;
}

const MAX_DIMENSION = 4000;
const MIN_DIMENSION = 1200;
const EXPORT_QUALITY = 0.95;

function stripExtension(name) {
  return String(name || "image").replace(/\.[^.]+$/, "") || "image";
}

function fileFromBlob(blob, name, type) {
  return new File([blob], name, { type, lastModified: Date.now() });
}

async function loadImageFromFile(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw(targetCtx, width, height) {
          targetCtx.drawImage(bitmap, 0, 0, width, height);
        },
        close() {
          bitmap.close();
        },
      };
    } catch {
      /* fall through to Image() */
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        draw(targetCtx, width, height) {
          targetCtx.drawImage(img, 0, 0, width, height);
        },
        close() {},
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image processing failed"))),
      "image/webp",
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

function estimateDimensions(width, height, fileSize, targetBytes) {
  const fitted = fitDimensions(width, height, MAX_DIMENSION);
  if (fileSize <= targetBytes) return fitted;

  const scale = Math.sqrt(targetBytes / fileSize) * 0.9;
  return {
    width: Math.max(MIN_DIMENSION, Math.round(fitted.width * scale)),
    height: Math.max(MIN_DIMENSION, Math.round(fitted.height * scale)),
  };
}

async function renderToWebP(source, width, height, canvas, quality = EXPORT_QUALITY) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  source.draw(ctx, width, height);

  return canvasToBlob(canvas, quality);
}

/**
 * Hybrid upload prep:
 * - HEIC/HEIF → always converted to WebP
 * - Other formats ≤ 5MB → original file unchanged
 * - Other formats > 5MB → resize only (no crop) at high quality until under 5MB
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

  const fromHeic = isHeicFile(file);
  const baseName = stripExtension(file instanceof File ? file.name : "image");
  let working = file;

  if (fromHeic) {
    const jpegBlob = await convertHeicToJpegBlob(file);
    working = fileFromBlob(jpegBlob, `${baseName}.jpg`, "image/jpeg");
  }

  if (!fromHeic && working.size <= IMAGE_UPLOAD_TARGET_BYTES && working instanceof File) {
    return working;
  }

  const source = await loadImageFromFile(working);
  const canvas = document.createElement("canvas");

  try {
    let { width, height } = estimateDimensions(
      source.width,
      source.height,
      working.size,
      IMAGE_UPLOAD_TARGET_BYTES,
    );

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const blob = await renderToWebP(source, width, height, canvas, EXPORT_QUALITY);
      if (blob.size <= IMAGE_UPLOAD_TARGET_BYTES) {
        return fileFromBlob(blob, `${baseName}.webp`, "image/webp");
      }

      if (width <= MIN_DIMENSION || height <= MIN_DIMENSION) break;

      const scale = Math.sqrt(IMAGE_UPLOAD_TARGET_BYTES / blob.size) * 0.95;
      width = Math.max(MIN_DIMENSION, Math.round(width * scale));
      height = Math.max(MIN_DIMENSION, Math.round(height * scale));
    }

    const blob = await renderToWebP(
      source,
      Math.max(width, MIN_DIMENSION),
      Math.max(height, MIN_DIMENSION),
      canvas,
      EXPORT_QUALITY,
    );

    if (blob.size > IMAGE_UPLOAD_TARGET_BYTES) {
      throw new Error(
        "Could not reduce this image under 5MB while keeping quality. Try a slightly smaller photo.",
      );
    }

    return fileFromBlob(blob, `${baseName}.webp`, "image/webp");
  } finally {
    source.close();
  }
}
