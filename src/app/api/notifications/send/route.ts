import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendPushToUser } from "@/lib/webpush";
import { getSubscriptionsByUser } from "@/lib/push-store";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { noticeId, title, message, type, collegeName, url } = await req.json();
    if (!title || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: session.id,
        type,
        title,
        collegeName: collegeName || "",
        message: message || "",
        noticeId: noticeId || null,
      },
    });

    const subscriptions = await getSubscriptionsByUser(session.id);
    if (subscriptions.length > 0) {
      sendPushToUser(
        subscriptions.map((s) => ({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth })),
        { title, body: message || title, url: url || "/notices" }
      );
    }

    return NextResponse.json(notification);
  } catch (err) {
    console.error("Send notification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
