import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { MAX_HERO_SLIDES } from "@/lib/constants";
import { normalizeHeroSlideInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import { COLLECTIONS, dbNow, listCollection, setDocument } from "@/lib/firestore";

export async function GET(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const slides = await listCollection(COLLECTIONS.heroSlides, {
      orderBy: "sortOrder",
      direction: "asc",
    });
    return NextResponse.json({ slides });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const existing = await listCollection(COLLECTIONS.heroSlides);
    if (existing.length >= MAX_HERO_SLIDES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_HERO_SLIDES} hero slides allowed.` },
        { status: 400 },
      );
    }

    const body = await request.json();
    const data = normalizeHeroSlideInput(body);
    if (!data.title || !data.image) {
      return NextResponse.json(
        { error: "Title and image are required." },
        { status: 400 },
      );
    }

    const id = body?.id || randomUUID();
    await setDocument(COLLECTIONS.heroSlides, id, {
      ...data,
      id,
      createdAt: dbNow(),
      updatedAt: dbNow(),
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
