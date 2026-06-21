import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export const COLLECTIONS = {
  users: "users",
  products: "products",
  orders: "orders",
  banners: "banners",
  media: "media",
  mediaOverrides: "mediaOverrides",
  heroSlides: "heroSlides",
  coupons: "coupons",
};

export function dbNow() {
  return FieldValue.serverTimestamp();
}

export function toPlainDoc(snapshot) {
  if (!snapshot.exists) return null;
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...convertFirestoreValue(data),
  };
}

function convertFirestoreValue(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(convertFirestoreValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, convertFirestoreValue(item)]),
    );
  }
  return value;
}

export async function listCollection(collectionName, { orderBy, direction = "desc" } = {}) {
  const db = getFirebaseAdminDb();
  let query = db.collection(collectionName);
  if (orderBy) {
    query = query.orderBy(orderBy, direction);
  }
  const snapshot = await query.get();
  return snapshot.docs.map(toPlainDoc).filter(Boolean);
}

export async function getDocument(collectionName, id) {
  const db = getFirebaseAdminDb();
  const snapshot = await db.collection(collectionName).doc(id).get();
  return toPlainDoc(snapshot);
}

export async function setDocument(collectionName, id, payload, { merge = true } = {}) {
  const db = getFirebaseAdminDb();
  await db.collection(collectionName).doc(id).set(payload, { merge });
}

export async function addDocument(collectionName, payload) {
  const db = getFirebaseAdminDb();
  const docRef = await db.collection(collectionName).add(payload);
  return docRef.id;
}

export async function deleteDocument(collectionName, id) {
  const db = getFirebaseAdminDb();
  await db.collection(collectionName).doc(id).delete();
}
