"use client";

import Image from "next/image";
import { useState } from "react";
import { RotateCw } from "lucide-react";
import AdminImageUploadButtons from "@/components/admin/AdminImageUploadButtons";
import MobileUploadQr from "@/components/admin/MobileUploadQr";
import {
  compressImageForUpload,
  isAcceptedImageFile,
} from "@/lib/compress-image";
import { prepareAndUploadImage } from "@/lib/cloudinary-client";
import { normalizeProductImageSrc } from "@/lib/product-images";
import { rotateImageFromUrl } from "@/lib/rotate-image";
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

export default function ColorImagesEditor({ colors, colorImages, onChange, productId }) {
  const [uploadingColor, setUploadingColor] = useState(null);
  const [rotatingKey, setRotatingKey] = useState(null);
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
    const files = Array.from(rawFiles || []).filter(isAcceptedImageFile);
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

      const uploads = await Promise.all(
        toUpload.map((file) =>
          prepareAndUploadImage(file, {
            folder: "mounis-maguva/products",
            prepare: compressImageForUpload,
          }),
        ),
      );

      for (const result of uploads) {
        if (merged.length >= MAX_IMAGES_PER_COLOR) break;
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

  function mergeSessionImages(color, sessionImages) {
    const existing = colorImages[color] || [];
    const merged = [...existing];
    for (const url of sessionImages) {
      if (merged.length >= MAX_IMAGES_PER_COLOR) break;
      const normalized = normalizeProductImageSrc(url, null);
      if (normalized && !merged.includes(normalized)) {
        merged.push(normalized);
      }
    }
    onChange(sanitizeColorImages({ ...colorImages, [color]: merged }));
  }

  async function rotateImage(color, url, index) {
    const key = `${color}-${index}`;
    if (rotatingKey || uploadingColor) return;

    setUploadError("");
    setRotatingKey(key);

    try {
      const rotatedFile = await rotateImageFromUrl(
        normalizeProductImageSrc(url, url),
        90,
        `${color}-${index + 1}`,
      );
      const result = await prepareAndUploadImage(rotatedFile, {
        folder: "mounis-maguva/products",
        prepare: compressImageForUpload,
      });
      const newUrl = normalizeProductImageSrc(result.url, null);
      if (!newUrl) throw new Error("Rotation upload failed");

      const list = [...(colorImages[color] || [])];
      const position = list.indexOf(url);
      if (position === -1) return;
      list[position] = newUrl;
      onChange(sanitizeColorImages({ ...colorImages, [color]: list }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not rotate image");
    } finally {
      setRotatingKey(null);
    }
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium">Images per color</legend>

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
                        className="object-contain p-2"
                        sizes="120px"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                      <span className="text-[10px] text-[var(--color-muted)]">
                        Image {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={Boolean(rotatingKey) || uploadingColor === color}
                          onClick={() => rotateImage(color, item.raw, index)}
                          className="inline-flex shrink-0 items-center gap-1 text-xs text-[var(--color-primary)] hover:underline disabled:opacity-50"
                        >
                          <RotateCw
                            className={`size-3 ${rotatingKey === `${color}-${index}` ? "animate-spin" : ""}`}
                          />
                          {rotatingKey === `${color}-${index}` ? "Rotating…" : "Rotate"}
                        </button>
                        <button
                          type="button"
                          className="shrink-0 text-xs text-red-600 hover:underline"
                          disabled={Boolean(rotatingKey)}
                          onClick={() => removeImage(color, item.raw)}
                        >
                          Remove
                        </button>
                      </div>
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
                <MobileUploadQr
                  color={color}
                  productId={productId}
                  disabled={uploadingColor === color}
                  onImagesSynced={(sessionImages) => mergeSessionImages(color, sessionImages)}
                />
                <AdminImageUploadButtons
                  disabled={uploadingColor === color}
                  uploading={uploadingColor === color}
                  uploadingLabel="Uploading..."
                  chooseLabel="Choose images to upload"
                  onFiles={(files) => uploadFilesForColor(color, files)}
                />
                <p className="mt-2 text-[10px] text-[var(--color-muted)]">
                  Use Rotate to fix photo orientation. Save the product to update the shop and product pages.
                </p>
              </>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
