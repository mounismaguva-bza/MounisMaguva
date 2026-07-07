import "server-only";

import { randomBytes } from "crypto";
import { getDocument, setDocument } from "@/lib/firestore";

const COLLECTION = "uploadSessions";
const SESSION_TTL_MS = 60 * 60 * 1000;

export async function createUploadSession({ color, productId, adminId }) {
  const token = randomBytes(16).toString("hex");
  const now = Date.now();
  await setDocument(
    COLLECTION,
    token,
    {
      color,
      productId: productId || null,
      adminId,
      images: [],
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    },
    { merge: false },
  );
  return token;
}

export async function getUploadSession(token) {
  const session = await getDocument(COLLECTION, token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) return null;
  return session;
}

export async function appendUploadSessionImages(token, urls, adminId) {
  const session = await getUploadSession(token);
  if (!session || session.adminId !== adminId) return null;

  const merged = [...(session.images || [])];
  for (const url of urls) {
    if (url && !merged.includes(url)) merged.push(url);
  }

  await setDocument(COLLECTION, token, { images: merged });
  return { ...session, images: merged };
}
