import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") || "50")));
    const search = url.searchParams.get("search") || "";

    const where = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }, { phone: { contains: search, mode: "insensitive" as const } }] }
      : {};

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.visitor.count({ where }),
    ]);

    return NextResponse.json({ visitors, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("List visitors error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
