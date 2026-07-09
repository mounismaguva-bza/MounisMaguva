import { NextResponse } from "next/server";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import { createR2UploadUrl } from "@/lib/r2";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const folder = String(body.folder || "mounis-maguva/products").trim();
    const contentType = String(body.contentType || "image/webp").trim().toLowerCase();

    if (contentType && !ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    const signed = await createR2UploadUrl({
      folder,
      contentType: contentType || "image/webp",
      filename: body.filename ? String(body.filename) : undefined,
    });

    return NextResponse.json({
      ok: true,
      ...signed,
    });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
