import "server-only";

import { v2 as cloudinary } from "cloudinary";

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Upload image bytes to Cloudinary.
 * @param {Buffer} buffer
 * @param {{ folder?: string; filename?: string }} [options]
 * @returns {Promise<{ url: string; publicId: string; width?: number; height?: number }>}
 */
export async function uploadImageToCloudinary(buffer, options = {}) {
  const cld = getCloudinary();
  const folder = options.folder || "mounis-maguva";

  const result = await new Promise((resolve, reject) => {
    const upload = cld.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        ...(options.filename ? { public_id: options.filename, overwrite: true } : {}),
      },
      (error, uploadResult) => {
        if (error) {
          const message =
            error?.message ||
            error?.error?.message ||
            (typeof error === "string" ? error : "Cloudinary upload failed");
          reject(new Error(message));
        } else resolve(uploadResult);
      },
    );
    upload.end(buffer);
  });

  if (!result?.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

/**
 * @param {string} publicId
 */
export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;
  const cld = getCloudinary();
  await cld.uploader.destroy(publicId, { resource_type: "image" });
}
