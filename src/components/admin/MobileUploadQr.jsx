"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ExternalLink, QrCode } from "lucide-react";
import QrUploadScanner, { QrScanButton } from "@/components/admin/QrUploadScanner";
import { isMobileCameraDevice } from "@/lib/device";

function buildUploadPath(token) {
  return `/admin/mobile-upload/${token}`;
}

export default function MobileUploadQr({
  color,
  productId,
  disabled,
  onImagesSynced,
}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const lastSyncedRef = useRef(0);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "",
  );

  const sessionToken = session?.token ?? "";
  const uploadPath = sessionToken ? buildUploadPath(sessionToken) : "";
  const uploadUrl = origin && uploadPath ? `${origin}${uploadPath}` : uploadPath;

  const createSession = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/upload-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ color, productId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not create upload QR");
      setSession({
        token: data.token,
        color: data.color,
        uploadPath: data.uploadPath || buildUploadPath(data.token),
      });
      lastSyncedRef.current = 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create upload QR");
    } finally {
      setLoading(false);
    }
  }, [color, productId]);

  useEffect(() => {
    if (!sessionToken) return undefined;

    const poll = async () => {
      const response = await fetch(`/api/admin/upload-session/${sessionToken}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;

      const images = data.images || [];
      if (images.length > lastSyncedRef.current) {
        onImagesSynced(images);
        lastSyncedRef.current = images.length;
      }
    };

    const id = window.setInterval(poll, 2500);
    return () => window.clearInterval(id);
  }, [sessionToken, onImagesSynced]);

  function handleScanUrl(url) {
    try {
      const scanned = new URL(url);
      window.location.href = `${scanned.pathname}${scanned.search}`;
    } catch {
      window.location.href = url;
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-[var(--color-primary)]/20 bg-white p-3">
      <div className="flex items-start gap-2">
        <QrCode className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-primary)]">Mobile upload via QR</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Scan the QR code with your phone camera to open the upload page for this color.
          </p>
        </div>
      </div>

      {!session ? (
        <button
          type="button"
          disabled={disabled || loading}
          onClick={createSession}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {loading ? "Creating QR…" : "Show upload QR code"}
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
              {uploadUrl ? (
                <QRCodeSVG value={uploadUrl} size={168} level="M" includeMargin />
              ) : null}
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs text-[var(--color-muted)]">
                1. Open upload page on your phone
                <br />
                2. Take or choose a photo — it auto-saves and closes
                <br />
                3. Images appear here automatically
              </p>
              {origin ? (
                <p className="break-all text-[10px] text-[var(--color-muted)]">{uploadUrl}</p>
              ) : null}
              <Link
                href={uploadPath}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-cream)]/50 sm:w-auto"
              >
                <ExternalLink className="size-4" />
                Open upload page
              </Link>
              {isMobileCameraDevice() ? (
                <QrScanButton
                  disabled={disabled}
                  onClick={() => setScannerOpen(true)}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60 sm:w-auto"
                />
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={createSession}
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            Refresh QR code
          </button>
        </div>
      )}

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <QrUploadScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanUrl={handleScanUrl}
      />
    </div>
  );
}
