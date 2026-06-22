import { NextResponse } from "next/server";
import { createCloudinaryUploadSignature } from "@/lib/cloudinary";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

export async function GET(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  try {
    const folder = new URL(request.url).searchParams.get("folder") || "mounis-maguva/products";
    const signature = createCloudinaryUploadSignature(folder);
    return NextResponse.json(signature);
  } catch (routeError) {
    return jsonError(routeError);
  }
}
