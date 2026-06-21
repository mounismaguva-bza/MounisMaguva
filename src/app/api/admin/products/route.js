import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { COLLECTIONS, dbNow, listCollection, setDocument } from "@/lib/firestore";
import { normalizeProductInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import { canAddProduct, getStoredProductCount, MAX_PRODUCTS } from "@/lib/product-limits";
import { revalidateStorefront } from "@/lib/revalidate-storefront";

export async function GET(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const products = await listCollection(COLLECTIONS.products, {
      orderBy: "updatedAt",
      direction: "desc",
    });
    const count = products.length;
    return NextResponse.json({
      products,
      count,
      maxProducts: MAX_PRODUCTS,
      canAdd: count < MAX_PRODUCTS,
    });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    if (!(await canAddProduct())) {
      const count = await getStoredProductCount();
      return NextResponse.json(
        {
          error: `Product limit reached (${MAX_PRODUCTS}). Delete a product before adding a new one.`,
          count,
          maxProducts: MAX_PRODUCTS,
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const data = normalizeProductInput(body);
    const id = body?.id || randomUUID();
    await setDocument(COLLECTIONS.products, id, {
      ...data,
      id,
      createdAt: dbNow(),
      updatedAt: dbNow(),
    });
    revalidateStorefront(data.slug);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
