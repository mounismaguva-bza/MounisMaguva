import { NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

const MAX_BYTES = 512 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  try {
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
      return NextResponse.json({ error: "Image must be 10MB or smaller" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImageToCloudinary(bytes, { folder });

    return NextResponse.json({
      ok: true,
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
    });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
