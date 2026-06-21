import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function assertFirebaseClientConfig() {
  const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
  const missing = requiredKeys.filter((key) => !firebaseConfig[key]);
  if (missing.length) {
    throw new Error(
      `Missing Firebase client config: ${missing
        .map((key) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`)
        .join(", ")}`,
    );
  }
}

export function getFirebaseClientApp() {
  if (!getApps().length) {
    assertFirebaseClientConfig();
    initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

export function getFirebaseClientAuth() {
  return getAuth(getFirebaseClientApp());
}
