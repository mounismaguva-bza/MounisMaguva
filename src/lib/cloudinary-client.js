/**
 * Browser helper: upload directly to Cloudinary (faster than proxying through our API).
 * @param {File} file
 * @param {{ folder?: string }} [options]
 */
export async function uploadImageViaCloudinary(file, options = {}) {
  const folder = options.folder || "mounis-maguva/products";

  const signResponse = await fetch(
    `/api/admin/cloudinary/sign?folder=${encodeURIComponent(folder)}`,
    { credentials: "include", cache: "no-store" },
  );
  const sign = await signResponse.json().catch(() => ({}));
  if (!signResponse.ok) {
    throw new Error(sign.error || "Could not prepare upload");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || data.error || "Upload failed");
  }

  return {
    ok: true,
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}

async function fetchUploadSignature(folder) {
  const signResponse = await fetch(
    `/api/admin/cloudinary/sign?folder=${encodeURIComponent(folder)}`,
    { credentials: "include", cache: "no-store" },
  );
  const sign = await signResponse.json().catch(() => ({}));
  if (!signResponse.ok) {
    throw new Error(sign.error || "Could not prepare upload");
  }
  return sign;
}

/**
 * Compress and upload in parallel where possible.
 * @param {File} file
 * @param {{ folder?: string; prepare?: (file: File) => Promise<File> }} [options]
 */
export async function prepareAndUploadImage(file, options = {}) {
  const folder = options.folder || "mounis-maguva/products";
  const prepare = options.prepare ?? ((value) => Promise.resolve(value));

  const [prepared, sign] = await Promise.all([
    prepare(file),
    fetchUploadSignature(folder),
  ]);

  const formData = new FormData();
  formData.append("file", prepared);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || data.error || "Upload failed");
  }

  return {
    ok: true,
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
  };
}
