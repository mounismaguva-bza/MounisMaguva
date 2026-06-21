import { NextResponse } from "next/server";
import {
  COLLECTIONS,
  dbNow,
  deleteDocument,
  getDocument,
  setDocument,
} from "@/lib/firestore";
import { appendStatusHistory, normalizeOrderInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

export async function GET(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const order = await getDocument(COLLECTIONS.orders, id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function PUT(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const existing = await getDocument(COLLECTIONS.orders, id);
    const body = await request.json();
    const data = normalizeOrderInput({ ...existing, ...body, id });
    const statusHistory = appendStatusHistory(existing, data.status);

    await setDocument(COLLECTIONS.orders, id, {
      ...data,
      id,
      statusHistory,
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
    await deleteDocument(COLLECTIONS.orders, id);
    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
