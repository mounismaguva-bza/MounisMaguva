import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { appendStatusHistory, normalizeOrderInput } from "@/lib/admin-models";
import { COLLECTIONS, dbNow, setDocument } from "@/lib/firestore";
import { toPublicOrder } from "@/lib/order-tracking";

export async function POST(request) {
  try {
    const body = await request.json();
    const data = normalizeOrderInput({
      ...body,
      status: "placed",
    });

    if (!data.customerPhone && !data.customerEmail) {
      return NextResponse.json(
        { error: "Phone or email is required to create an order." },
        { status: 400 },
      );
    }

    const id = randomUUID();
    const statusHistory = appendStatusHistory(null, "placed");

    await setDocument(COLLECTIONS.orders, id, {
      ...data,
      id,
      statusHistory,
      createdAt: dbNow(),
      updatedAt: dbNow(),
    });

    return NextResponse.json(
      {
        ok: true,
        order: toPublicOrder({
          id,
          ...data,
          statusHistory,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create order" },
      { status: 500 },
    );
  }
}
