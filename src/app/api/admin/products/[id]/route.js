import { NextResponse } from "next/server";
import {
  COLLECTIONS,
  dbNow,
  deleteDocument,
  getDocument,
  setDocument,
} from "@/lib/firestore";
import { normalizeProductInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export async function GET(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const product = await getDocument(COLLECTIONS.products, id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
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
    const data = normalizeProductInput(body);
    await setDocument(COLLECTIONS.products, id, {
      ...data,
      id,
      updatedAt: dbNow(),
    });
    revalidateStorefront(data.slug);
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
    const existing = await getDocument(COLLECTIONS.products, id);
    await deleteDocument(COLLECTIONS.products, id);
    revalidateStorefront(existing?.slug);
    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
