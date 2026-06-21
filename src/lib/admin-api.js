import { NextResponse } from "next/server";
import { requireAdminFromRequest, unauthorizedResponse } from "@/lib/admin-auth";

export async function requireAdminApi(request) {
  const admin = await requireAdminFromRequest(request);
  if (!admin) {
    return { error: unauthorizedResponse() };
  }
  return { admin };
}

export function jsonError(error, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unexpected error" },
    { status },
  );
}
