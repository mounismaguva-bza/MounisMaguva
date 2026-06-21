import { NextResponse } from "next/server";
import { validateCouponCode } from "@/lib/coupons";

export async function POST(request) {
  try {
    const body = await request.json();
    const code = String(body?.code || "");
    const subtotal = Number(body?.subtotal) || 0;

    if (subtotal <= 0) {
      return NextResponse.json(
        { valid: false, error: "Add items to your bag before applying a coupon." },
        { status: 400 },
      );
    }

    const result = await validateCouponCode(code, subtotal);
    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: error instanceof Error ? error.message : "Validation failed" },
      { status: 500 },
    );
  }
}
