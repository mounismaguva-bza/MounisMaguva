import "server-only";

import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client = null;
let corsReady = false;
let corsPromise = null;

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function getR2Client() {
  if (client) return client;

  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  client = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    },
    // Avoid signing checksum headers — browser PUTs won't send them and R2 rejects the upload.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return client;
}

function getPublicBaseUrl() {
  const configured = process.env.R2_PUBLIC_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  throw new Error(
    "Missing R2_PUBLIC_URL. In Cloudflare R2, enable public access (R2.dev subdomain or custom domain) and set R2_PUBLIC_URL to that base URL.",
  );
}

const ALLOWED_UPLOAD_FOLDER_PREFIX = "mounis-maguva";

export function assertAllowedUploadFolder(folder) {
  const value = String(folder || "").trim();
  if (!value.startsWith(ALLOWED_UPLOAD_FOLDER_PREFIX)) {
    throw new Error("Invalid upload folder");
  }
  return value;
}

function extensionFromContentType(contentType) {
  const type = String(contentType || "").toLowerCase();
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (type.includes("avif")) return "avif";
  if (type.includes("heic") || type.includes("heif")) return "heic";
  return "jpg";
}

function buildObjectKey(folder, filename, contentType) {
  const safeFolder = assertAllowedUploadFolder(folder || "mounis-maguva");
  const ext = extensionFromContentType(contentType);
  const base = filename
    ? String(filename).replace(/\.[^.]+$/, "")
    : randomUUID();
  return `${safeFolder.replace(/\/$/, "")}/${base}.${ext}`;
}

function assertAllowedObjectKey(key) {
  const value = String(key || "").trim();
  if (!value.startsWith(`${ALLOWED_UPLOAD_FOLDER_PREFIX}/`)) {
    throw new Error("Invalid object key");
  }
  return value;
}

function publicUrlForKey(key) {
  return `${getPublicBaseUrl()}/${key}`;
}

/**
 * Ensure the bucket accepts browser PUTs from local + production origins.
 * Runs once per server process.
 */
export async function ensureR2Cors() {
  if (corsReady) return true;
  if (corsPromise) return corsPromise;

  corsPromise = (async () => {
    try {
      await getR2Client().send(
        new PutBucketCorsCommand({
          Bucket: requiredEnv("R2_BUCKET"),
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: [
                  "http://localhost:3000",
                  "http://127.0.0.1:3000",
                  "https://www.mounismaguva.com",
                  "https://mounismaguva.com",
                ],
                AllowedMethods: ["GET", "PUT", "HEAD"],
                AllowedHeaders: ["*"],
                ExposeHeaders: ["ETag", "Location"],
                MaxAgeSeconds: 86400,
              },
            ],
          },
        }),
      );
      corsReady = true;
      return true;
    } catch (error) {
      console.error("R2 CORS setup failed:", error);
      return false;
    } finally {
      corsPromise = null;
    }
  })();

  return corsPromise;
}

/**
 * Create a short-lived signed PUT URL so the browser uploads directly to R2.
 * @param {{ folder?: string; filename?: string; contentType?: string; expiresIn?: number }} [options]
 */
export async function createR2UploadUrl(options = {}) {
  await ensureR2Cors();

  const bucket = requiredEnv("R2_BUCKET");
  const contentType = options.contentType || "image/webp";
  const key = buildObjectKey(options.folder, options.filename, contentType);
  const expiresIn = options.expiresIn || 120;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn });

  return {
    uploadUrl,
    url: publicUrlForKey(key),
    publicId: key,
    contentType,
    expiresIn,
  };
}

/**
 * Create a short-lived signed PUT URL to replace an existing R2 object (same URL).
 * @param {string} key
 * @param {{ contentType?: string; expiresIn?: number }} [options]
 */
export async function createR2OverwriteUrl(key, options = {}) {
  await ensureR2Cors();

  const objectKey = assertAllowedObjectKey(key);
  const bucket = requiredEnv("R2_BUCKET");
  const contentType = options.contentType || "image/webp";
  const expiresIn = options.expiresIn || 120;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
    CacheControl: "public, max-age=0, must-revalidate",
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn });

  return {
    uploadUrl,
    url: publicUrlForKey(objectKey),
    publicId: objectKey,
    contentType,
    expiresIn,
  };
}

/**
 * Upload image bytes/stream to Cloudflare R2 (server-side fallback).
 * @param {Buffer | Uint8Array | import('stream').Readable} body
 * @param {{ folder?: string; filename?: string; contentType?: string; contentLength?: number }} [options]
 */
export async function uploadImageToR2(body, options = {}) {
  const bucket = requiredEnv("R2_BUCKET");
  const contentType = options.contentType || "image/jpeg";
  const key = buildObjectKey(options.folder, options.filename, contentType);

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ...(Number.isFinite(options.contentLength)
        ? { ContentLength: options.contentLength }
        : {}),
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    url: publicUrlForKey(key),
    publicId: key,
    contentType,
  };
}

/**
 * Replace an existing R2 object in place (keeps the same public URL).
 * @param {Buffer | Uint8Array | import('stream').Readable} body
 * @param {string} key
 * @param {{ contentType?: string; contentLength?: number }} [options]
 */
export async function uploadImageToR2AtKey(body, key, options = {}) {
  const objectKey = assertAllowedObjectKey(key);
  const bucket = requiredEnv("R2_BUCKET");
  const contentType = options.contentType || "image/jpeg";

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
      ...(Number.isFinite(options.contentLength)
        ? { ContentLength: options.contentLength }
        : {}),
      CacheControl: "public, max-age=0, must-revalidate",
    }),
  );

  return {
    url: publicUrlForKey(objectKey),
    publicId: objectKey,
    contentType,
  };
}

/**
 * Resolve an R2 object key from a public URL or storage path.
 * Non-R2 URLs (e.g. Cloudinary) return null and are left alone.
 * @param {string | null | undefined} urlOrKey
 * @returns {string | null}
 */
export function getR2ObjectKey(urlOrKey) {
  const value = String(urlOrKey || "").trim();
  if (!value) return null;

  if (
    value.startsWith(`${ALLOWED_UPLOAD_FOLDER_PREFIX}/`) &&
    !/^https?:\/\//i.test(value)
  ) {
    return value;
  }

  const publicBase = process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (!publicBase) return null;

  try {
    const absolute = new URL(value, publicBase).toString();
    if (!absolute.startsWith(`${publicBase}/`)) return null;
    const key = decodeURIComponent(absolute.slice(publicBase.length + 1));
    if (!key.startsWith(`${ALLOWED_UPLOAD_FOLDER_PREFIX}/`)) return null;
    return key;
  } catch {
    return null;
  }
}

/**
 * Delete one object from R2. Ignores missing/non-R2 keys.
 * @param {string | null | undefined} urlOrKey
 */
export async function deleteImageFromR2(urlOrKey) {
  const key = getR2ObjectKey(urlOrKey);
  if (!key) return false;

  try {
    await getR2Client().send(
      new DeleteObjectCommand({
        Bucket: requiredEnv("R2_BUCKET"),
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    console.error("R2 delete failed:", key, error);
    return false;
  }
}

/**
 * Delete many R2 objects (unique keys only).
 * @param {Array<string | null | undefined>} urlsOrKeys
 */
export async function deleteImagesFromR2(urlsOrKeys) {
  const keys = [
    ...new Set(
      (Array.isArray(urlsOrKeys) ? urlsOrKeys : [])
        .map((value) => getR2ObjectKey(value))
        .filter(Boolean),
    ),
  ];

  const results = await Promise.all(keys.map((key) => deleteImageFromR2(key)));
  return results.filter(Boolean).length;
}
