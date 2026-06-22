import "server-only";

import { v2 as cloudinary } from "cloudinary";

let configured = false;

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
    );
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

const ALLOWED_UPLOAD_FOLDER_PREFIX = "mounis-maguva";

export function assertAllowedUploadFolder(folder) {
  const value = String(folder || "").trim();
  if (!value.startsWith(ALLOWED_UPLOAD_FOLDER_PREFIX)) {
    throw new Error("Invalid upload folder");
  }
  return value;
}

/** Signed params for direct browser → Cloudinary upload (skips server file proxy). */
export function createCloudinaryUploadSignature(folder) {
  const cld = getCloudinary();
  const safeFolder = assertAllowedUploadFolder(folder);
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: safeFolder };
  const signature = cld.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder: safeFolder,
  };
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
