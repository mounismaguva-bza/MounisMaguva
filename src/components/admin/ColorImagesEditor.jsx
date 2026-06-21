"use client";

import Image from "next/image";
import { useState } from "react";
import { compressImageForUpload, IMAGE_UPLOAD_TARGET_BYTES } from "@/lib/compress-image";
import { uploadImageViaCloudinary } from "@/lib/cloudinary-client";
import { normalizeProductImageSrc } from "@/lib/product-images";
import { MAX_IMAGES_PER_COLOR } from "@/lib/constants";
import { sanitizeColorImages } from "@/lib/sanitize-color-images";

function getClipboardImageFiles(clipboardData) {
  const files = [];
  if (!clipboardData?.items) return files;
  for (const item of clipboardData.items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
}

export default function ColorImagesEditor({ colors, colorImages, onChange }) {
  const [uploadingColor, setUploadingColor] = useState(null);
  const [uploadError, setUploadError] = useState("");

  if (!colors.length) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Add at least one color above to upload images per color.
      </p>
    );
  }

  function removeImage(color, url) {
    const next = (colorImages[color] || []).filter((u) => u !== url);
    const updated = { ...colorImages };
    if (next.length) {
      updated[color] = next;
    } else {
      delete updated[color];
    }
    onChange(sanitizeColorImages(updated));
  }

  async function uploadFilesForColor(color, rawFiles) {
    const files = Array.from(rawFiles || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    const existing = colorImages[color] || [];
    const remaining = MAX_IMAGES_PER_COLOR - existing.length;
    if (remaining <= 0) {
      setUploadError(`"${color}" already has ${MAX_IMAGES_PER_COLOR} photos. Remove one to add more.`);
      return;
    }

    setUploadError("");
    setUploadingColor(color);

    try {
      const merged = [...existing];
      const toUpload = files.slice(0, remaining);
      if (files.length > remaining) {
        setUploadError(
          `Only ${remaining} more photo${remaining === 1 ? "" : "s"} allowed for "${color}" (max ${MAX_IMAGES_PER_COLOR}).`,
        );
      }

      for (const file of toUpload) {
        if (merged.length >= MAX_IMAGES_PER_COLOR) break;
        const compressed = await compressImageForUpload(file);
        const result = await uploadImageViaCloudinary(compressed, {
          folder: "mounis-maguva/products",
        });
        const normalized = normalizeProductImageSrc(result.url, null);
        if (normalized && !merged.includes(normalized)) {
          merged.push(normalized);
        }
      }

      onChange(sanitizeColorImages({ ...colorImages, [color]: merged }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingColor(null);
    }
  }

  function handlePaste(color, event) {
    const files = getClipboardImageFiles(event.clipboardData);
    if (!files.length) return;
    event.preventDefault();
    uploadFilesForColor(color, files);
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium">Images per color</legend>
      <p className="text-xs text-[var(--color-muted)]">
        Upload or paste images (Ctrl+V). Up to {MAX_IMAGES_PER_COLOR} photos per color. Each image
        is optimized to about {Math.round(IMAGE_UPLOAD_TARGET_BYTES / 1024)}KB at high quality,
        then stored on Cloudinary.
      </p>

      {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}

      {colors.map((color) => {
        const images = (colorImages[color] || [])
          .map((url) => ({ raw: url, safe: normalizeProductImageSrc(url, null) }))
          .filter((item) => item.safe);

        const count = images.length;
        const atLimit = count >= MAX_IMAGES_PER_COLOR;

        return (
          <div
            key={color}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)]/30 p-3"
            onPaste={(e) => {
              if (!atLimit) handlePaste(color, e);
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--color-primary)]">{color}</p>
              <span className="text-xs text-[var(--color-muted)]">
                {count} / {MAX_IMAGES_PER_COLOR} photos
              </span>
            </div>

            {images.length > 0 ? (
              <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {images.map((item, index) => (
                  <li
                    key={`${color}-${item.raw}-${index}`}
                    className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white"
                  >
                    <div className="relative aspect-square bg-[var(--color-surface)]">
                      <Image
                        src={item.safe}
                        alt={`${color} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                      <span className="text-[10px] text-[var(--color-muted)]">
                        Image {index + 1}
                      </span>
                      <button
                        type="button"
                        className="shrink-0 text-xs text-red-600 hover:underline"
                        onClick={() => removeImage(color, item.raw)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-2 text-xs text-[var(--color-muted)]">No images for this color yet.</p>
            )}

            {atLimit ? (
              <p className="text-xs text-[var(--color-muted)]">
                Maximum {MAX_IMAGES_PER_COLOR} photos reached. Remove one to replace.
              </p>
            ) : (
              <>
                <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--color-primary)]/40 bg-white px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-cream)]/50">
                  {uploadingColor === color ? "Uploading..." : "Choose images to upload"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    disabled={uploadingColor === color}
                    onChange={(e) => {
                      uploadFilesForColor(color, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p className="mt-2 text-[10px] text-[var(--color-muted)]">
                  Tip: click this color box, then paste a copied image with Ctrl+V.
                </p>
              </>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
