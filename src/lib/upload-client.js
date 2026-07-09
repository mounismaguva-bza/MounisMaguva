/**
 * Browser helper: compress then upload directly to Cloudflare R2 (presigned PUT).
 * Existing Cloudinary image URLs stay as-is in product/media data.
 * @param {File} file
 * @param {{ folder?: string; prepare?: (file: File) => Promise<File> }} [options]
 */
export async function prepareAndUploadImage(file, options = {}) {
  const folder = options.folder || "mounis-maguva/products";
  const prepare = options.prepare ?? ((value) => Promise.resolve(value));

  // Compress while fetching a signed URL (CORS is applied server-side on sign).
  const [prepared, signed] = await Promise.all([
    prepare(file),
    fetchR2Sign(folder, "image/webp"),
  ]);

  const contentType = prepared.type || "image/webp";
  const activeSigned =
    contentType === signed.contentType
      ? signed
      : await fetchR2Sign(
          folder,
          contentType,
          prepared instanceof File ? prepared.name : undefined,
        );

  try {
    const uploadResponse = await fetch(activeSigned.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: prepared,
    });

    if (uploadResponse.ok) {
      return {
        ok: true,
        url: activeSigned.url,
        publicId: activeSigned.publicId,
      };
    }
  } catch {
    /* fall through to proxy */
  }

  // Only used when R2 CORS/token API is blocked — keep compression small so this stays quick.
  return uploadViaProxy(prepared, folder);
}

async function fetchR2Sign(folder, contentType, filename) {
  const response = await fetch("/api/admin/r2/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ folder, contentType, filename }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Could not prepare upload");
  }
  return data;
}

async function uploadViaProxy(prepared, folder) {
  const formData = new FormData();
  formData.append("file", prepared);
  formData.append("folder", folder);

  const response = await fetch("/api/admin/r2/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Upload failed");
  }

  return {
    ok: true,
    url: data.url,
    publicId: data.publicId,
  };
}

/**
 * Delete one or more R2 image URLs. Cloudinary / other hosts are ignored by the API.
 * @param {string | string[]} urls
 */
export async function deleteUploadedImages(urls) {
  const list = (Array.isArray(urls) ? urls : [urls])
    .map((url) => String(url || "").trim())
    .filter(Boolean);
  if (!list.length) return { ok: true, deleted: 0 };

  const response = await fetch("/api/admin/r2/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ urls: list }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Could not delete image from storage");
  }

  return { ok: true, deleted: data.deleted || 0 };
}
