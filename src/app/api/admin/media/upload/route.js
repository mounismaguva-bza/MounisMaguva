import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { COLLECTIONS, dbNow, setDocument } from "@/lib/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { requireAdminApi, jsonError } from "@/lib/admin-api";

export async function POST(request) {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const usageTagsRaw = form.get("usageTags");
    const altText = String(form.get("altText") || "").trim();
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const mediaId = randomUUID();
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImageToCloudinary(bytes, {
      folder: "mounis-maguva/media",
      filename: mediaId,
    });

    const usageTags = String(usageTagsRaw || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    await setDocument(COLLECTIONS.media, mediaId, {
      id: mediaId,
      url: uploaded.url,
      storagePath: uploaded.publicId,
      usageTags,
      altText,
      createdAt: dbNow(),
      updatedAt: dbNow(),
    });

    return NextResponse.json({
      ok: true,
      media: { id: mediaId, url: uploaded.url, storagePath: uploaded.publicId },
    });
  } catch (routeError) {
    return jsonError(routeError);
  }
}
