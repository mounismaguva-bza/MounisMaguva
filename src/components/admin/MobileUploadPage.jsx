"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import {
  compressImageForUpload,
  IMAGE_UPLOAD_ACCEPT,
  isAcceptedImageFile,
} from "@/lib/compress-image";
import { prepareAndUploadImage } from "@/lib/cloudinary-client";
import { normalizeProductImageSrc } from "@/lib/product-images";
import { MAX_IMAGES_PER_COLOR } from "@/lib/constants";

const AUTO_CLOSE_MS = 900;

export default function MobileUploadPage({ token, initialSession }) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef(null);

  const refreshSession = useCallback(async () => {
    const response = await fetch(`/api/admin/upload-session/${token}`, {
      credentials: "include",
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setSession(data);
  }, [token]);

  useEffect(() => {
    const id = window.setInterval(refreshSession, 4000);
    return () => window.clearInterval(id);
  }, [refreshSession]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const closePage = useCallback(() => {
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
  }, [router]);

  const scheduleAutoClose = useCallback(() => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      closePage();
    }, AUTO_CLOSE_MS);
  }, [closePage]);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []).filter(isAcceptedImageFile);
    if (!files.length || uploading) return;

    const count = session.images?.length || 0;
    const remaining = MAX_IMAGES_PER_COLOR - count;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES_PER_COLOR} photos reached for this color.`);
      return;
    }

    setError("");
    setStatus("");
    setUploading(true);

    try {
      const toUpload = files.slice(0, remaining);
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
      setStatus(
        `${urls.length} photo${urls.length === 1 ? "" : "s"} saved. Closing…`,
      );
      scheduleAutoClose();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removeSavedImage(url) {
    if (uploading) return;

    setError("");
    const response = await fetch(`/api/admin/upload-session/${token}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || "Could not remove image");
      return;
    }
    setSession(data);
  }

  const images = session.images || [];

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col gap-5 px-4 py-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Mobile upload
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--color-primary)]">
            {session.color}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Take or choose a photo — it saves automatically and this page closes.
          </p>
        </div>
        <button
          type="button"
          disabled={uploading || closing}
          onClick={closePage}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-cream)]/60 disabled:opacity-50"
          aria-label="Cancel and close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label
          className={`inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            disabled={uploading || closing}
            onChange={(e) => {
              uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <ImagePlus className="size-4" />
          Take photo
        </label>
        <label
          className={`inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-cream)]/50 ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            multiple
            className="sr-only"
            disabled={uploading || closing}
            onChange={(e) => {
              uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <ImagePlus className="size-4" />
          Choose images
        </label>
      </div>

      {uploading ? (
        <p className="text-sm font-medium text-[var(--color-primary)]">Uploading and saving…</p>
      ) : null}
      {status ? <p className="text-sm font-medium text-emerald-700">{status}</p> : null}
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
                <button
                  type="button"
                  disabled={uploading || closing}
                  onClick={() => removeSavedImage(url)}
                  className="absolute top-1 right-1 inline-flex size-7 items-center justify-center rounded-full bg-black/65 text-white disabled:opacity-50"
                  aria-label="Remove saved photo"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">No photos saved yet.</p>
        )}
      </div>
    </div>
  );
}
