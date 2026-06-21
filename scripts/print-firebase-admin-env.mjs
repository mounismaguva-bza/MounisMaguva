/**
 * Print FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY for Vercel.
 * Usage: node scripts/print-firebase-admin-env.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const filePath =
  process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH || "firebase-service-account.json";
const absolutePath = resolve(process.cwd(), filePath);

try {
  const parsed = JSON.parse(readFileSync(absolutePath, "utf8"));
  const privateKeyForEnv = parsed.private_key.replace(/\n/g, "\\n");

  console.log("\nAdd these to Vercel → Settings → Environment Variables:\n");
  console.log(`FIREBASE_PROJECT_ID=${parsed.project_id}`);
  console.log(`FIREBASE_CLIENT_EMAIL=${parsed.client_email}`);
  console.log(`FIREBASE_PRIVATE_KEY=${privateKeyForEnv}`);
  console.log("\nAlso set ADMIN_EMAILS=your-login-email@example.com\n");
} catch (error) {
  console.error(`Could not read ${absolutePath}:`, error.message);
  process.exit(1);
}
   