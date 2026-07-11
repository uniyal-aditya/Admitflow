import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";
import { sendPushToUser } from "@/lib/webpush";
import { sendEmail } from "@/lib/email";
import { emailTemplate } from "@/lib/email-template";

const CONCURRENCY_LIMIT = 10;

async function sendBatched<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  batchSize = CONCURRENCY_LIMIT
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(fn));
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, message, type, collegeName, url, channels } = await req.json();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const notifyType = type || "general";
    const notifyCollege = collegeName || "AdmitFlow";

    const users = await prisma.user.findMany({
      include: {
        settings: true,
        pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } },
      },
    });

    let pushSent = 0;
    let emailsSent = 0;

    const notifyAll = await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: notifyType,
        title,
        collegeName: notifyCollege,
        message: message || "",
        noticeId: url || null,
      })),
    });

    const userSubs: { endpoint: string; p256dh: string; auth: string }[] = [];
    const emailRecipients: { email: string; name: string | null }[] = [];

    for (const user of users) {
      if (channels?.push !== false && user.settings?.deviceNotifications !== false) {
        for (const sub of user.pushSubscriptions) {
          userSubs.push({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth });
        }
      }
      if (channels?.email !== false && user.email && user.settings?.emailNotifications !== false) {
        emailRecipients.push({ email: user.email, name: user.name });
      }
    }

    if (userSubs.length > 0) {
      await sendPushToUser(userSubs, {
        title,
        body: message || title,
        url: url || "/notices",
      });
      pushSent = userSubs.length;
    }

    if (emailRecipients.length > 0) {
      await sendBatched(emailRecipients, async (recipient) => {
        try {
          await sendEmail({
            to: recipient.email,
            subject: `[AdmitFlow] ${title}`,
            text: `${message || title}\n\n${url ? `View details: ${url}\n` : ""}You are receiving this because you enabled email notifications in AdmitFlow settings.`,
            html: emailTemplate(title, message || title, url || undefined),
          });
          emailsSent++;
        } catch (err) {
          console.error(`Email send failed for ${recipient.email}:`, err);
        }
      });
    }

    return NextResponse.json({ notified: notifyAll.count, pushSent, emailsSent, totalUsers: users.length });
  } catch (err) {
    console.error("Broadcast error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
