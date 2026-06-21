import { NextResponse } from "next/server";
import {
  COLLECTIONS,
  dbNow,
  deleteDocument,
  getDocument,
  setDocument,
} from "@/lib/firestore";
import { normalizeBannerInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

export async function GET(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const banner = await getDocument(COLLECTIONS.banners, id);
    if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ banner });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function PUT(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const body = await request.json();
    const data = normalizeBannerInput(body);
    await setDocument(COLLECTIONS.banners, id, {
      ...data,
      id,
      updatedAt: dbNow(),
    });
    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    await deleteDocument(COLLECTIONS.banners, id);
    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
