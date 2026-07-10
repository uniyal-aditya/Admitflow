import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, referralSource, isPwaUser, userAgent } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const visitor = await prisma.visitor.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        referralSource: referralSource?.trim() || null,
        isPwaUser: !!isPwaUser,
        userAgent: userAgent?.slice(0, 500) || null,
      },
    });

    return NextResponse.json(visitor);
  } catch (err) {
    console.error("Visitor create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
