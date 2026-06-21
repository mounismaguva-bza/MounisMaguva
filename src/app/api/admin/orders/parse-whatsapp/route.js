import { NextResponse } from "next/server";
import { COLLECTIONS, listCollection } from "@/lib/firestore";
import {
  enrichOrderItemsFromCatalog,
  parseWhatsAppOrderMessage,
} from "@/lib/parse-whatsapp-order";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  try {
    const body = await request.json();
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Paste a WhatsApp order message first." }, { status: 400 });
    }

    const parsed = parseWhatsAppOrderMessage(message);
    const products = await listCollection(COLLECTIONS.products);
    const { items, warnings } = enrichOrderItemsFromCatalog(parsed.items, products);

    if (!items.length) {
      return NextResponse.json(
        {
          error: "No products found in this message. Check the format matches a cart WhatsApp order.",
          items: [],
          warnings,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      items,
      couponCode: parsed.couponCode,
      discountAmount: parsed.discountAmount,
      total: parsed.total,
      note: parsed.note,
      warnings,
    });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
