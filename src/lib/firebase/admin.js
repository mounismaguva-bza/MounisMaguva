import "server-only";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function readServiceAccountFile(filePath) {
  const absolutePath = resolve(/* turbopackIgnore: true */ process.cwd(), filePath);
  return readFileSync(absolutePath, "utf8");
}

/** Handles Vercel/.env formats: literal \\n, real newlines, optional quotes. */
function normalizePrivateKey(key) {
  if (!key) return key;
  let normalized = key.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }
  return normalized.replace(/\\n/g, "\n");
}

function credentialsFromParsedServiceAccount(parsed, fallbackProjectId) {
  return {
    projectId: parsed.project_id || fallbackProjectId,
    clientEmail: parsed.client_email,
    privateKey: normalizePrivateKey(parsed.private_key),
  };
}

function parseServiceAccountJson(raw) {
  try {
    return JSON.parse(raw.trim());
  } catch {
    throw new Error("SERVICE_ACCOUNT / FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY is not valid JSON.");
  }
}

function getServiceAccountFromEnv() {
  const fallbackProjectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  // Preferred: split env vars (works well on Vercel)
  if (fallbackProjectId && clientEmail && privateKey) {
    return {
      projectId: fallbackProjectId,
      clientEmail,
      privateKey,
    };
  }

  const jsonRaw =
    process.env.SERVICE_ACCOUNT?.trim() ||
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (jsonRaw) {
    return credentialsFromParsedServiceAccount(parseServiceAccountJson(jsonRaw), fallbackProjectId);
  }

  const filePath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH;
  if (filePath && process.env.VERCEL !== "1") {
    const parsed = JSON.parse(readServiceAccountFile(filePath));
    return credentialsFromParsedServiceAccount(parsed, fallbackProjectId);
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Firebase Admin is not configured on Vercel. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY, then redeploy.",
    );
  }

  throw new Error(
    "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, or FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH for local dev.",
  );
}

export function hasFirebaseAdminCredentials() {
  try {
    getServiceAccountFromEnv();
    return true;
  } catch {
    return false;
  }
}

function assertServiceAccount(credentials) {
  if (!credentials.projectId || !credentials.clientEmail || !credentials.privateKey) {
    throw new Error("Invalid Firebase Admin service account credentials");
  }
  if (!credentials.privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY looks invalid. Use \\n for line breaks, e.g. -----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
    );
  }
  return credentials;
}

export function getFirebaseAdminApp() {
  if (!getApps().length) {
    const credential = cert(assertServiceAccount(getServiceAccountFromEnv()));
    const storageBucket =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET;
    initializeApp({
      credential,
      storageBucket,
    });
  }
  return getApps()[0];
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}

export function getFirebaseAdminStorage() {
  return getStorage(getFirebaseAdminApp());
}
