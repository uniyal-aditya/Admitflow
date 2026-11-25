import { prisma } from "@/lib/db/prisma";
import { sendPushToUser } from "@/lib/webpush";
import { sendEmail } from "@/lib/email";
import { emailTemplate } from "@/lib/email-template";

const MAX_RECIPIENTS = 500;

/**
 * Tells everyone who follows the notice's college, as soon as the notice is published.
 * Mirrors /api/notifications/check (same settings, same types), but runs from the
 * server, so followers do not have to open the app first. A user who already has a
 * notification for this notice is skipped, so running it twice is harmless.
 */
export async function notifyFollowers(noticeId: string): Promise<{ notified: number }> {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      include: { college: { select: { shortName: true } } },
    });
    if (!notice || notice.status !== "published" || !notice.collegeId) return { notified: 0 };

    const candidates = await prisma.user.findMany({
      where: {
        favorites: { some: { collegeId: notice.collegeId } },
        settings: { is: { OR: [{ deviceNotifications: true }, { emailNotifications: true }] } },
      },
      take: MAX_RECIPIENTS,
      include: {
        settings: true,
        pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } },
      },
    });

    const already = await prisma.notification.findMany({
      where: { noticeId: notice.id, userId: { in: candidates.map((u) => u.id) } },
      select: { userId: true },
    });
    const alreadySet = new Set(already.map((a) => a.userId));

    const recipients = candidates.filter(
      (u) => !alreadySet.has(u.id) && u.settings && u.settings.notificationTypes.split(",").includes(notice.type),
    );
    if (recipients.length === 0) return { notified: 0 };

    const collegeName = notice.college?.shortName ?? "";
    const message = notice.summary || notice.title;
    await prisma.notification.createMany({
      data: recipients.map((u) => ({
        userId: u.id, type: notice.type, title: notice.title, collegeName, message, noticeId: notice.id,
      })),
    });

    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://admitflowin.vercel.app";
    const link = `${baseUrl}/notices/${notice.id}`;

    // Push and email in small groups so one slow or failing delivery does not hold up the rest.
    for (let i = 0; i < recipients.length; i += 10) {
      await Promise.allSettled(
        recipients.slice(i, i + 10).map(async (u) => {
          if (u.settings?.deviceNotifications && u.pushSubscriptions.length > 0) {
            const results = await sendPushToUser(u.pushSubscriptions, { title: notice.title, body: message, url: `/notices/${notice.id}` });
            const stale = u.pushSubscriptions.filter((_, idx) => results[idx] === false).map((s) => s.endpoint);
            if (stale.length > 0) await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: stale } } });
          }
          if (u.settings?.emailNotifications && u.email) {
            await sendEmail({
              to: u.email,
              subject: `New notice from ${collegeName || "a college you follow"}`,
              text: `${notice.title}\n\n${link}`,
              html: emailTemplate("New notice for you", `${collegeName ? collegeName + ": " : ""}${notice.title}`, undefined, [{ title: notice.title, url: link }]),
            });
          }
        }),
      );
    }
    return { notified: recipients.length };
  } catch (err) {
    console.error("notifyFollowers failed:", err);
    return { notified: 0 };
  }
}
