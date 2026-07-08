"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";

function isUploadUrl(text) {
  try {
    const url = new URL(text);
    return url.pathname.includes("/admin/mobile-upload/");
  } catch {
    return false;
  }
}

export default function QrUploadScanner({ open, onClose, onScanUrl }) {
  const containerId = useId().replace(/:/g, "");
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      await scanner.stop();
    } catch {
      /* ignore */
    }
    try {
      scanner.clear();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) {
      stopScanner();
      return undefined;
    }

    let cancelled = false;

    async function startScanner() {
      setStarting(true);
      setError("");

      try {
        await stopScanner();
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (cancelled) return;
            if (!isUploadUrl(decodedText)) {
              setError("Scan the upload QR code shown on the product form.");
              return;
            }
            stopScanner();
            onScanUrl(decodedText);
            onClose();
          },
          () => {},
        );
      } catch {
        if (!cancelled) {
          setError(
            "Could not start QR scanner. Allow camera permission, or tap Open upload page instead.",
          );
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [open, containerId, onClose, onScanUrl, stopScanner]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end bg-black/70 sm:items-center sm:p-4"
      onClick={() => {
        stopScanner();
        onClose();
      }}
    >
      <div
        className="w-full overflow-hidden rounded-t-2xl border border-white/10 bg-[#1a0505] text-white sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-sm font-medium">Scan upload QR code</p>
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close scanner"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative bg-black p-4">
          <div id={containerId} className="overflow-hidden rounded-xl" />
          {starting ? (
            <p className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm">
              Starting scanner…
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 text-center text-sm text-red-200">{error}</p>
          ) : (
            <p className="mt-3 text-center text-xs text-white/75">
              Point your camera at the upload QR code on the product page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function QrScanButton({ onClick, disabled, className }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      <Camera className="size-4 shrink-0" aria-hidden />
      Scan QR to upload
    </button>
  );
}
