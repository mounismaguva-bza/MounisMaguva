"use client";

import { useRef } from "react";
import { Images } from "lucide-react";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/compress-image";
import { cn } from "@/lib/utils";

export default function AdminImageUploadButtons({
  disabled = false,
  multiple = true,
  uploading = false,
  uploadingLabel = "Uploading...",
  chooseLabel = "Choose images",
  className,
  onFiles,
}) {
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const files = event.target.files;
    if (!files?.length) return;
    onFiles(files);
    event.target.value = "";
  }

  const busy = disabled || uploading;

  return (
    <div className={cn(className)}>
      <button
        type="button"
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-primary)]/40 bg-white px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-cream)]/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Images className="size-4 shrink-0" aria-hidden />
        {uploading ? uploadingLabel : chooseLabel}
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
    </div>
  );
}
