import { NextResponse } from "next/server";
import { COLLECTIONS, dbNow, listCollection, setDocument } from "@/lib/firestore";
import { normalizeMediaOverrideInput } from "@/lib/admin-models";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

export async function GET(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const overrides = await listCollection(COLLECTIONS.mediaOverrides, {
      orderBy: "updatedAt",
      direction: "desc",
    });
    return NextResponse.json({ overrides });
  } catch (routeError) {
    return jsonError(routeError);
  }
}

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;
  try {
    const body = await request.json();
    const data = normalizeMediaOverrideInput(body);
    if (!data.alias || !data.url) {
      return NextResponse.json({ error: "alias and url are required" }, { status: 400 });
    }

    await setDocument(COLLECTIONS.mediaOverrides, data.alias, {
      ...data,
      id: data.alias,
      updatedAt: dbNow(),
    });
    return NextResponse.json({ ok: true });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
