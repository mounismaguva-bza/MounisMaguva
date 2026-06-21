import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import {
  ADMIN_SESSION_COOKIE,
  buildSessionCookieOptions,
  createAdminSessionCookie,
  getAdminProfile,
  isAdminUser,
} from "@/lib/admin-auth";

function loginErrorResponse(error) {
  const message = error instanceof Error ? error.message : "Invalid login";

  if (
    message.includes("Firebase Admin is not configured") ||
    message.includes("Missing Firebase Admin") ||
    message.includes("FIREBASE_PRIVATE_KEY")
  ) {
    return NextResponse.json(
      {
        error:
          "Server setup: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on Vercel, then redeploy.",
      },
      { status: 503 },
    );
  }

  if (message === "FORBIDDEN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  return NextResponse.json(
    {
      error:
        process.env.NODE_ENV === "development"
          ? message
          : "Could not verify sign-in. Check Firebase Admin env vars on Vercel.",
    },
    { status: 401 },
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const idToken = body?.idToken;
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);

    if (!(await isAdminUser(decoded))) {
      return NextResponse.json(
        {
          error:
            'Access denied. Set ADMIN_EMAILS on Vercel or create Firestore users/{uid} with role: "admin".',
          uid: decoded.uid,
        },
        { status: 403 },
      );
    }

    const sessionCookie = await createAdminSessionCookie(idToken);
    const admin = await getAdminProfile(decoded);
    const response = NextResponse.json({ ok: true, admin });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, buildSessionCookieOptions());
    return response;
  } catch (error) {
    return loginErrorResponse(error);
  }
}
