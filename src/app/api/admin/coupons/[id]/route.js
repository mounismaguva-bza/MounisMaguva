import { NextResponse } from "next/server";
import { normalizeCouponInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import {
  COLLECTIONS,
  dbNow,
  deleteDocument,
  getDocument,
  setDocument,
} from "@/lib/firestore";

export async function GET(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const coupon = await getDocument(COLLECTIONS.coupons, id);
    if (!coupon) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ coupon });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function PUT(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const existing = await getDocument(COLLECTIONS.coupons, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = normalizeCouponInput({ ...existing, ...body, code: id });

    if (!data.discountValue || data.discountValue <= 0) {
      return NextResponse.json(
        { error: "Discount value must be greater than 0." },
        { status: 400 },
      );
    }

    await setDocument(COLLECTIONS.coupons, id, {
      ...data,
      id,
      code: id,
      updatedAt: dbNow(),
    });

    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function PATCH(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    const existing = await getDocument(COLLECTIONS.coupons, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    if (typeof body.active !== "boolean") {
      return NextResponse.json({ error: "active boolean is required." }, { status: 400 });
    }

    await setDocument(COLLECTIONS.coupons, id, {
      active: body.active,
      updatedAt: dbNow(),
    });

    return NextResponse.json({ ok: true, active: body.active });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const { id } = await params;
    await deleteDocument(COLLECTIONS.coupons, id);
    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
