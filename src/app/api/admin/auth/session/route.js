import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    admin: {
      uid: admin.uid,
      email: admin.email || null,
      name: admin.name || null,
      role: admin.role,
    },
  });
}
