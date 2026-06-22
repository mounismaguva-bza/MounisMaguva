/** Upload the original file up to this size — no re-encoding on the client. */
export const IMAGE_UPLOAD_MAX_BYTES = 12 * 1024 * 1024;

/** @deprecated Kept for UI copy compatibility. */
export const IMAGE_UPLOAD_TARGET_BYTES = IMAGE_UPLOAD_MAX_BYTES;

function stripExtension(name) {
  return String(name || "image").replace(/\.[^.]+$/, "") || "image";
}

function fileFromBlob(blob, name, type) {
  return new File([blob], name, { type, lastModified: Date.now() });
}

/**
 * Pass through the original image bytes so colors and quality stay unchanged.
 * No canvas processing, no format conversion, no cropping.
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
      `Image is too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum is ${maxMb}MB.`,
    );
  }

  if (file instanceof File) return file;

  const type = file.type || "image/jpeg";
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  return fileFromBlob(file, `${stripExtension("image")}.${ext}`, type);
}
