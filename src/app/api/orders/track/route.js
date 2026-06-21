import { NextResponse } from "next/server";
import { COLLECTIONS, listCollection } from "@/lib/firestore";
import {
  filterOrdersByContact,
  isActiveTrackableOrder,
  normalizeEmail,
  normalizePhone,
  toPublicOrder,
} from "@/lib/order-tracking";

export async function POST(request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(body?.phone);
    const email = normalizeEmail(body?.email);

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Enter your mobile number or email to track your order." },
        { status: 400 },
      );
    }

    const orders = await listCollection(COLLECTIONS.orders, {
      orderBy: "updatedAt",
      direction: "desc",
    });

    const matches = filterOrdersByContact(orders, { phone, email })
      .filter((order) => isActiveTrackableOrder(order.status))
      .map(toPublicOrder);

    return NextResponse.json({ orders: matches });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tracking failed" },
      { status: 500 },
    );
  }
}
