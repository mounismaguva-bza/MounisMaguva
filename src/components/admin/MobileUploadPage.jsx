"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ImagePlus, RefreshCw, Upload, X } from "lucide-react";
import {
  compressImageForUpload,
  IMAGE_UPLOAD_ACCEPT,
  isAcceptedImageFile,
} from "@/lib/compress-image";
import { prepareAndUploadImage } from "@/lib/cloudinary-client";
import { normalizeProductImageSrc } from "@/lib/product-images";
import { MAX_IMAGES_PER_COLOR } from "@/lib/constants";

function revokePreviewUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export default function MobileUploadPage({ token, initialSession }) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState(initialSession.images?.length || 0);
  const [closing, setClosing] = useState(false);
  const pendingFilesRef = useRef(pendingFiles);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  const refreshSession = useCallback(async () => {
    const response = await fetch(`/api/admin/upload-session/${token}`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setSession(data);
      setSavedCount(data.images?.length || 0);
    }
  }, [token]);

  useEffect(() => {
    const id = window.setInterval(refreshSession, 4000);
    return () => window.clearInterval(id);
  }, [refreshSession]);

  useEffect(() => {
    return () => {
      pendingFilesRef.current.forEach((item) => revokePreviewUrl(item.previewUrl));
    };
  }, []);

  function addPendingFiles(fileList) {
    const files = Array.from(fileList || []).filter(isAcceptedImageFile);
    if (!files.length) return;

    const currentCount = session.images?.length || 0;
    const pendingCount = pendingFiles.length;
    const remaining = MAX_IMAGES_PER_COLOR - currentCount - pendingCount;

    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES_PER_COLOR} photos allowed for this color.`);
      return;
    }

    const next = files.slice(0, remaining).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setError("");
    setPendingFiles((current) => [...current, ...next]);

    if (files.length > remaining) {
      setError(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} can be added.`);
    }
  }

  function removePendingFile(id) {
    setPendingFiles((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) revokePreviewUrl(item.previewUrl);
      return current.filter((entry) => entry.id !== id);
    });
  }

  async function handleUpload() {
    if (!pendingFiles.length || uploading) return;

    const count = session.images?.length || 0;
    const remaining = MAX_IMAGES_PER_COLOR - count;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES_PER_COLOR} photos reached for this color.`);
      return;
    }

    setError("");
    setUploading(true);

    try {
      const toUpload = pendingFiles.slice(0, remaining).map((item) => item.file);
      const uploads = await Promise.all(
        toUpload.map((file) =>
          prepareAndUploadImage(file, {
            folder: "mounis-maguva/products",
            prepare: compressImageForUpload,
          }),
        ),
      );

      const urls = uploads
        .map((item) => normalizeProductImageSrc(item.url, null))
        .filter(Boolean);

      if (!urls.length) throw new Error("Upload failed");

      const response = await fetch(`/api/admin/upload-session/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ urls }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save uploaded images");

      setSession(data);
      setSavedCount(data.images?.length || 0);
      pendingFiles.forEach((item) => revokePreviewUrl(item.previewUrl));
      setPendingFiles([]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSaveAndClose() {
    setClosing(true);

    if (typeof window !== "undefined") {
      if (window.opener && !window.opener.closed) {
        window.close();
        return;
      }
      if (window.history.length > 1) {
        router.back();
        return;
      }
    }

    router.push("/admin/products");
  }

  const images = session.images || [];
  const hasPending = pendingFiles.length > 0;
  const canUpload = hasPending && !uploading;
  const canClose = savedCount > 0 && !hasPending && !uploading;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col gap-5 px-4 py-6 pb-28">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Mobile upload
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
          {session.color}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Choose photos, tap Upload, then Save &amp; close when finished.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-cream)]/50">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              addPendingFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <ImagePlus className="size-4" />
          Take photo
        </label>
        <label className="inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-cream)]/50">
          <input
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              addPendingFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <ImagePlus className="size-4" />
          Choose images
        </label>
      </div>

      {hasPending ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <p className="mb-3 text-sm font-medium">
            Ready to upload ({pendingFiles.length})
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {pendingFiles.map((item) => (
              <li key={item.id} className="relative aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={item.previewUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removePendingFile(item.id)}
                  className="absolute top-1 right-1 inline-flex size-7 items-center justify-center rounded-full bg-black/65 text-white"
                  aria-label="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Saved ({images.length})</p>
          <button
            type="button"
            onClick={refreshSession}
            className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
        </div>
        {images.length ? (
          <ul className="grid grid-cols-3 gap-2">
            {images.map((url) => (
              <li key={url} className="relative aspect-square overflow-hidden rounded-lg border">
                <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">No photos saved yet.</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <button
            type="button"
            disabled={!canUpload}
            onClick={handleUpload}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="size-4" />
            {uploading
              ? "Uploading…"
              : hasPending
                ? `Upload ${pendingFiles.length} photo${pendingFiles.length === 1 ? "" : "s"}`
                : "Upload"}
          </button>
          <button
            type="button"
            disabled={!canClose || closing}
            onClick={handleSaveAndClose}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="size-4" />
            {closing ? "Closing…" : "Save & close"}
          </button>
        </div>
      </div>
    </div>
  );
}
