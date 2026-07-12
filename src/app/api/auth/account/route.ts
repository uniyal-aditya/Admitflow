import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession, clearSession } from "@/lib/auth";

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    await prisma.$transaction([
      prisma.favorite.deleteMany({ where: { userId } }),
      prisma.download.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.pushSubscription.deleteMany({ where: { userId } }),
      prisma.review.deleteMany({ where: { userId } }),
      prisma.comment.deleteMany({ where: { userId } }),
      prisma.post.deleteMany({ where: { userId } }),
      prisma.suggestion.deleteMany({ where: { userId } }),
      prisma.userSettings.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    await clearSession();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
