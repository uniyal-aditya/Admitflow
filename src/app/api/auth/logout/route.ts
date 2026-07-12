import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";

export async function POST() {
  const session = await getSession();
  if (session?.email) {
    await logAdminAction("user_logout", `User ${session.name || session.email} logged out`, session.email);
  }
  await clearSession();
  return NextResponse.json({ success: true });
}
