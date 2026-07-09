import { NextResponse } from "next/server";
import { normalizeHeroSlideInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import {
  COLLECTIONS,
  dbNow,
  deleteDocument,
  getDocument,
  setDocument,
} from "@/lib/firestore";
import { deleteImagesFromR2 } from "@/lib/r2";

export async function GET(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const slide = await getDocument(COLLECTIONS.heroSlides, id);
    if (!slide) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ slide });
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
    const existing = await getDocument(COLLECTIONS.heroSlides, id);
    const data = normalizeHeroSlideInput(body);
    if (!data.title || !data.image) {
      return NextResponse.json(
        { error: "Title and image are required." },
        { status: 400 },
      );
    }

    await setDocument(COLLECTIONS.heroSlides, id, {
      ...data,
      id,
      updatedAt: dbNow(),
    });

    if (existing?.image && existing.image !== data.image) {
      await deleteImagesFromR2([existing.image]);
    }

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
    const existing = await getDocument(COLLECTIONS.heroSlides, id);
    await deleteDocument(COLLECTIONS.heroSlides, id);
    if (existing?.image) {
      await deleteImagesFromR2([existing.image]);
    }
    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
