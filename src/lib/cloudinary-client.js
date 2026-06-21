/**
 * Browser helper: upload a file to Cloudinary via admin API.
 * @param {File} file
 * @param {{ folder?: string }} [options]
 */
export async function uploadImageViaCloudinary(file, options = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (options.folder) formData.append("folder", options.folder);

  const response = await fetch("/api/admin/cloudinary/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data;
}
