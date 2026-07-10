import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  return NextResponse.json({ admin: !!admin, role: admin?.role || null });
}
