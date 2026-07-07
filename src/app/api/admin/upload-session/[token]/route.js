import { NextResponse } from "next/server";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import {
  appendUploadSessionImages,
  getUploadSession,
  removeUploadSessionImage,
} from "@/lib/upload-session";

export async function GET(request, { params }) {
  const { error, admin } = await requireAdminApi(request);
  if (error) return error;

  const { token } = await params;

  try {
    const session = await getUploadSession(token);
    if (!session || session.adminId !== admin.uid) {
      return NextResponse.json({ error: "Upload session not found." }, { status: 404 });
    }

    return NextResponse.json({
      token,
      color: session.color,
      productId: session.productId,
      images: session.images || [],
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(request, { params }) {
  const { error, admin } = await requireAdminApi(request);
  if (error) return error;

  const { token } = await params;
  const body = await request.json().catch(() => ({}));
  const urls = Array.isArray(body.urls)
    ? body.urls.map((url) => String(url).trim()).filter(Boolean)
    : [];

  if (!urls.length) {
    return NextResponse.json({ error: "No image URLs provided." }, { status: 400 });
  }

  try {
    const session = await appendUploadSessionImages(token, urls, admin.uid);
    if (!session) {
      return NextResponse.json({ error: "Upload session not found." }, { status: 404 });
    }

    return NextResponse.json({
      token,
      color: session.color,
      images: session.images,
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(request, { params }) {
  const { error, admin } = await requireAdminApi(request);
  if (error) return error;

  const { token } = await params;
  const body = await request.json().catch(() => ({}));
  const url = String(body.url || "").trim();

  if (!url) {
    return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  }

  try {
    const session = await removeUploadSessionImage(token, url, admin.uid);
    if (!session) {
      return NextResponse.json({ error: "Upload session not found." }, { status: 404 });
    }

    return NextResponse.json({
      token,
      color: session.color,
      images: session.images,
    });
  } catch (err) {
    return jsonError(err);
  }
}
