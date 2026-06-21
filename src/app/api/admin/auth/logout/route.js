import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, buildSessionCookieOptions } from "@/lib/admin-auth";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...buildSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
