import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  COLLECTIONS,
  dbNow,
  deleteDocument,
  getDocument,
  listCollection,
  setDocument,
} from "@/lib/firestore";
import { normalizeMediaInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

export async function GET(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const media = await listCollection(COLLECTIONS.media, {
      orderBy: "createdAt",
      direction: "desc",
    });
    return NextResponse.json({ media });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const body = await request.json();
    const data = normalizeMediaInput(body);
    const id = body?.id || randomUUID();
    await setDocument(COLLECTIONS.media, id, {
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

export async function DELETE(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const existing = await getDocument(COLLECTIONS.media, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await deleteDocument(COLLECTIONS.media, id);
    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
