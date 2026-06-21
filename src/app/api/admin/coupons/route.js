import { NextResponse } from "next/server";
import { normalizeCouponInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";
import {
  COLLECTIONS,
  dbNow,
  getDocument,
  listCollection,
  setDocument,
} from "@/lib/firestore";

export async function GET(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const coupons = await listCollection(COLLECTIONS.coupons, {
      orderBy: "updatedAt",
      direction: "desc",
    });
    return NextResponse.json({ coupons });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const body = await request.json();
    const data = normalizeCouponInput(body);

    if (!data.code) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }
    if (!data.discountValue || data.discountValue <= 0) {
      return NextResponse.json(
        { error: "Discount value must be greater than 0." },
        { status: 400 },
      );
    }
    if (data.discountType === "percent" && data.discountValue > 100) {
      return NextResponse.json(
        { error: "Percent discount cannot exceed 100." },
        { status: 400 },
      );
    }

    const existing = await getDocument(COLLECTIONS.coupons, data.code);
    if (existing) {
      return NextResponse.json(
        { error: "This coupon code already exists." },
        { status: 409 },
      );
    }

    await setDocument(COLLECTIONS.coupons, data.code, {
      ...data,
      id: data.code,
      createdAt: dbNow(),
      updatedAt: dbNow(),
    });

    return NextResponse.json({ ok: true, id: data.code }, { status: 201 });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
