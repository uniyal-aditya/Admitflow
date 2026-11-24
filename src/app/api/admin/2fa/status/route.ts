import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin({ allowUnverified2fa: true });
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.admin.findUnique({ where: { email: admin.email } });
  return NextResponse.json({ enabled: !!record?.totpSecret, email: admin.email });
}
