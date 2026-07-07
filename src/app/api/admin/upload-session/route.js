import { NextResponse } from "next/server";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import { createUploadSession } from "@/lib/upload-session";
import { SITE_URL } from "@/lib/seo";

export async function POST(request) {
  const { error, admin } = await requireAdminApi(request);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const color = String(body.color || "").trim();
  if (!color) {
    return NextResponse.json({ error: "Color is required." }, { status: 400 });
  }

  try {
    const productId = body.productId ? String(body.productId) : null;
    const token = await createUploadSession({
      color,
      productId,
      adminId: admin.uid,
    });

    const uploadPath = `/admin/mobile-upload/${token}`;
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const origin = host ? `${proto}://${host}` : SITE_URL;
    const uploadUrl = `${origin}${uploadPath}`;

    return NextResponse.json({
      token,
      uploadPath,
      uploadUrl,
      color,
      productId,
    });
  } catch (err) {
    return jsonError(err);
  }
}
