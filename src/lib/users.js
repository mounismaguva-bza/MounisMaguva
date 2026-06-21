import "server-only";

import { COLLECTIONS, getDocument } from "@/lib/firestore";

/** Firestore: users/{uid} with field role: "admin" */
export const USER_ROLES = {
  admin: "admin",
  user: "user",
};

/**
 * @param {string} uid Firebase Auth UID (document id)
 */
export async function getUserByUid(uid) {
  if (!uid) return null;
  return getDocument(COLLECTIONS.users, uid);
}

/**
 * @param {string} uid
 */
export async function isFirestoreAdmin(uid) {
  const profile = await getUserByUid(uid);
  return profile?.role === USER_ROLES.admin;
}
