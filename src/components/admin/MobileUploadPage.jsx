"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, RefreshCw, X } from "lucide-react";
import {
  compressImageForUpload,
  IMAGE_UPLOAD_ACCEPT,
  isAcceptedImageFile,
} from "@/lib/compress-image";
import { prepareAndUploadImage } from "@/lib/upload-client";
import { normalizeProductImageSrc } from "@/lib/product-images";

const MOBILE_UPLOAD_MAX_IMAGES = 1;
const AUTO_CLOSE_MS = 3000;

export default function MobileUploadPage({ token, initialSession }) {
  const [session, setSession] = useState(initialSession);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [closing, setClosing] = useState(false);
  const [finished, setFinished] = useState(null);
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
    if (closing) return undefined;
    const id = window.setInterval(refreshSession, 4000);
    return () => window.clearInterval(id);
  }, [refreshSession, closing]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const finishPage = useCallback((uploaded) => {
    setClosing(true);
    setFinished(uploaded ? "uploaded" : "closed");
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    if (typeof window !== "undefined") {
      window.close();
    }
  }, []);

  const scheduleAutoClose = useCallback(() => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      finishPage(true);
    }, AUTO_CLOSE_MS);
  }, [finishPage]);

  async function uploadFiles(fileList) {
    const file = Array.from(fileList || []).filter(isAcceptedImageFile)[0];
    if (!file || uploading || closing) return;

    const count = session.images?.length || 0;
    if (count >= MOBILE_UPLOAD_MAX_IMAGES) {
      setError("Only one photo is allowed per upload link.");
      scheduleAutoClose();
      return;
    }

    setError("");
    setStatus("");
    setUploading(true);

    try {
      const result = await prepareAndUploadImage(file, {
        folder: "mounis-maguva/products",
        prepare: compressImageForUpload,
      });

      const url = normalizeProductImageSrc(result.url, null);
      if (!url) throw new Error("Upload failed");

      const response = await fetch(`/api/admin/upload-session/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ urls: [url] }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save uploaded image");

      setSession(data);
      setStatus("Photo saved. Closing in 3 seconds…");
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
  const atLimit = images.length >= MOBILE_UPLOAD_MAX_IMAGES;
  const uploadDisabled = uploading || closing || atLimit;

  if (finished) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-8 text-center">
        {finished === "uploaded" ? (
          <CheckCircle2 className="size-14 text-emerald-600" aria-hidden />
        ) : null}
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-primary)]">
          {finished === "uploaded" ? "Upload complete" : "Closed"}
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-[var(--color-muted)]">
          {finished === "uploaded"
            ? "Your photo was saved. You can close this tab and return to the product form on your other device."
            : "You can close this tab now."}
        </p>
      </div>
    );
  }

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
            Take or choose one photo — it saves automatically and this page closes in 3 seconds.
          </p>
        </div>
        <button
          type="button"
          disabled={uploading || closing}
          onClick={() => finishPage(false)}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:bg-[var(--color-cream)]/60 disabled:opacity-50"
          aria-label="Cancel and close"
        >
          <X className="size-5" />
        </button>
      </div>

      {atLimit ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          One photo uploaded. This page will close shortly.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] ${uploadDisabled ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={uploadDisabled}
              onChange={(e) => {
                uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <ImagePlus className="size-4" />
            Take photo
          </label>
          <label
            className={`inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-primary)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-cream)]/50 ${uploadDisabled ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              type="file"
              accept={IMAGE_UPLOAD_ACCEPT}
              className="sr-only"
              disabled={uploadDisabled}
              onChange={(e) => {
                uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <ImagePlus className="size-4" />
            Choose image
          </label>
        </div>
      )}

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
