"use client";

import { useRef } from "react";
import { Camera, Images } from "lucide-react";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/compress-image";
import { cn } from "@/lib/utils";

export default function AdminImageUploadButtons({
  disabled = false,
  multiple = true,
  uploading = false,
  uploadingLabel = "Uploading...",
  chooseLabel = "Choose images",
  cameraLabel = "Take photo",
  className,
  onFiles,
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  function handleFileChange(event) {
    const files = event.target.files;
    if (!files?.length) return;
    onFiles(files);
    event.target.value = "";
  }

  const busy = disabled || uploading;

  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row", className)}>
      <button
        type="button"
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-primary)]/40 bg-white px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-cream)]/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Images className="size-4 shrink-0" aria-hidden />
        {uploading ? uploadingLabel : chooseLabel}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => cameraInputRef.current?.click()}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Camera className="size-4 shrink-0" aria-hidden />
        {cameraLabel}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        multiple={multiple}
        className="sr-only"
        disabled={busy}
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={busy}
        onChange={handleFileChange}
      />
    </div>
  );
}
