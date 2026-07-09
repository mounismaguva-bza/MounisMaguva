import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import { IMAGE_UPLOAD_TARGET_BYTES } from "@/lib/compress-image";
import { ensureR2Cors, uploadImageToR2 } from "@/lib/r2";

/** Small buffer above client compress target for edge cases. */
const MAX_BYTES = IMAGE_UPLOAD_TARGET_BYTES + 512 * 1024;
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
    // Best-effort: unlock direct browser uploads for later requests.
    void ensureR2Cors();

    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "mounis-maguva/products").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      const maxMb = Math.round(IMAGE_UPLOAD_TARGET_BYTES / (1024 * 1024));
      return NextResponse.json(
        {
          error: `Image must be ${maxMb}MB or smaller. Large files are auto-compressed before upload — try again or use a smaller photo.`,
        },
        { status: 400 },
      );
    }

    // Stream file → R2 (avoid buffering a second full Buffer copy).
    const nodeStream = Readable.fromWeb(file.stream());
    const uploaded = await uploadImageToR2(nodeStream, {
      folder,
      contentType: file.type || "image/webp",
      contentLength: file.size,
    });

    return NextResponse.json({
      ok: true,
      url: uploaded.url,
      publicId: uploaded.publicId,
    });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
