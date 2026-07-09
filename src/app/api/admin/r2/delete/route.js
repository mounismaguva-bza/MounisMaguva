import { NextResponse } from "next/server";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import { deleteImagesFromR2 } from "@/lib/r2";

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const urls = Array.isArray(body.urls)
      ? body.urls
      : body.url
        ? [body.url]
        : [];

    const cleaned = urls.map((url) => String(url || "").trim()).filter(Boolean);
    if (!cleaned.length) {
      return NextResponse.json({ error: "No image URLs provided." }, { status: 400 });
    }

    const deleted = await deleteImagesFromR2(cleaned);
    return NextResponse.json({ ok: true, deleted });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
