import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { COLLECTIONS, dbNow, listCollection, setDocument } from "@/lib/firestore";
import { normalizeBannerInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

export async function GET(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const banners = await listCollection(COLLECTIONS.banners, {
      orderBy: "sortOrder",
      direction: "asc",
    });
    return NextResponse.json({ banners });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const body = await request.json();
    const data = normalizeBannerInput(body);
    const id = body?.id || randomUUID();
    await setDocument(COLLECTIONS.banners, id, {
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
