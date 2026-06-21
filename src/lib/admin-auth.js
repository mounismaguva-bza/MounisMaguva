import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getUserByUid, isFirestoreAdmin } from "@/lib/users";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5;

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** Optional fallback: custom claims or ADMIN_EMAILS env */
function hasTokenAdminClaim(decodedToken) {
  if (!decodedToken) return false;
  if (decodedToken.admin === true) return true;
  if (decodedToken.role === "admin") return true;
  if (Array.isArray(decodedToken.roles) && decodedToken.roles.includes("admin")) {
    return true;
  }
  const allowedEmails = getAllowedAdminEmails();
  if (!allowedEmails.length) return false;
  return allowedEmails.includes((decodedToken.email || "").toLowerCase());
}

/**
 * Primary check: Firestore users/{uid} with role === "admin"
 * @param {import("firebase-admin/auth").DecodedIdToken} decodedToken
 */
export async function isAdminUser(decodedToken) {
  if (!decodedToken?.uid) return false;

  if (await isFirestoreAdmin(decodedToken.uid)) {
    return true;
  }

  return hasTokenAdminClaim(decodedToken);
}

/**
 * @param {import("firebase-admin/auth").DecodedIdToken} decodedToken
 */
export async function getAdminProfile(decodedToken) {
  const firestoreUser = await getUserByUid(decodedToken.uid);
  return {
    uid: decodedToken.uid,
    email: firestoreUser?.email || decodedToken.email || null,
    name: firestoreUser?.name || decodedToken.name || null,
    role: firestoreUser?.role || (hasTokenAdminClaim(decodedToken) ? "admin" : "user"),
    profile: firestoreUser,
  };
}

export async function createAdminSessionCookie(idToken) {
  const auth = getFirebaseAdminAuth();
  const decodedToken = await auth.verifyIdToken(idToken, true);

  if (!(await isAdminUser(decodedToken))) {
    throw new Error("FORBIDDEN");
  }

  return auth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });
}

export async function verifyAdminSessionCookie(sessionCookie, checkRevoked = true) {
  if (!sessionCookie) return null;
  const auth = getFirebaseAdminAuth();
  const decoded = await auth.verifySessionCookie(sessionCookie, checkRevoked);

  if (!(await isAdminUser(decoded))) {
    return null;
  }

  return getAdminProfile(decoded);
}

export async function getAdminFromCookies() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  try {
    return await verifyAdminSessionCookie(sessionCookie);
  } catch {
    return null;
  }
}

export async function requireAdminFromRequest(request) {
  const sessionCookie =
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value ||
    request.headers.get("x-admin-session");
  if (!sessionCookie) {
    return null;
  }
  try {
    return await verifyAdminSessionCookie(sessionCookie);
  } catch {
    return null;
  }
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function buildSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  };
}
