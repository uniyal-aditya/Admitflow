import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";
import { getNotices } from "@/lib/services/admission";
import { sendPushToUser } from "@/lib/webpush";
import { sendEmail } from "@/lib/email";
import { emailTemplate } from "@/lib/email-template";

export async function POST() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        settings: true,
        favorites: { select: { collegeId: true } },
        pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const settings = user.settings;
    if (!settings || (!settings.deviceNotifications && !settings.emailNotifications)) {
      return NextResponse.json({ ok: true, skipped: "notifications_disabled" });
    }

    const favoriteCollegeIds = user.favorites.map((f) => f.collegeId);
    const selectedTypes = settings.notificationTypes.split(",");

    const existingNotifs = await prisma.notification.findMany({
      where: { userId: session.id, noticeId: { not: null } },
      select: { noticeId: true },
    });
    const alreadyNotified = new Set(existingNotifs.map((n) => n.noticeId));

    const notices = await getNotices();
    const matching = notices.filter((n) => {
      if (alreadyNotified.has(n.id)) return false;
      if (!selectedTypes.includes(n.type)) return false;
      if (favoriteCollegeIds.length > 0 && !favoriteCollegeIds.includes(n.collegeId)) return false;
      return true;
    });

    if (matching.length === 0) {
      return NextResponse.json({ ok: true, newNotifications: 0 });
    }

    const now = new Date();
    await prisma.notification.createMany({
      data: matching.map((n) => ({
        userId: session.id,
        type: n.type,
        title: n.title,
        collegeName: "",
        message: n.summary || n.title,
        noticeId: n.id,
        createdAt: now,
      })),
    });

    if (settings.deviceNotifications && user.pushSubscriptions.length > 0) {
      for (const notice of matching.slice(0, 5)) {
        const results = await sendPushToUser(
          user.pushSubscriptions.map((s) => ({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth })),
          { title: notice.title, body: notice.summary || notice.title, url: `/notices/${notice.id}` }
        );
        const staleEndpoints = user.pushSubscriptions
          .filter((_, i) => results[i] === false)
          .map((s) => s.endpoint);
        if (staleEndpoints.length > 0) {
          await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: staleEndpoints } } });
        }
      }
    }

    if (settings.emailNotifications && user.email) {
      const noticeLinks = matching.slice(0, 5).map((n) => ({
        title: n.title,
        url: `${process.env.NEXT_PUBLIC_URL || "https://admitflowin.vercel.app"}/notices/${n.id}`,
      }));

      await sendEmail({
        to: user.email,
        subject: `New notices match your preferences (${matching.length})`,
        text: `${matching.length} new notice${matching.length > 1 ? "s" : ""} for you from your favorite colleges.`,
        html: emailTemplate(
          `${matching.length} new notice${matching.length > 1 ? "s" : ""} for you`,
          `We found new notices matching your preferences from your favorite colleges.`,
          undefined,
          noticeLinks
        ),
      });
    }

    return NextResponse.json({ ok: true, newNotifications: matching.length });
  } catch (err) {
    console.error("Notification check error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
