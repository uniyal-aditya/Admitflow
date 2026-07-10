import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/admin";
import { sendPushToUser } from "@/lib/webpush";

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
    let notified = 0;

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
    notified = notifyAll.count;

    const userSubs: { endpoint: string; p256dh: string; auth: string }[] = [];
    const emailRecipients: { email: string; name: string | null }[] = [];

    for (const user of users) {
      if (channels?.push !== false) {
        for (const sub of user.pushSubscriptions) {
          userSubs.push({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth });
        }
      }
      if (channels?.email !== false && user.email && user.settings?.emailNotifications) {
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
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpFrom = process.env.SMTP_FROM || smtpUser;

      if (smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost, port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        for (const recipient of emailRecipients) {
          try {
            await transporter.sendMail({
              from: `"AdmitFlow" <${smtpFrom}>`,
              to: recipient.email,
              subject: `[AdmitFlow] ${title}`,
              text: `${message || title}\n\n${url ? `View details: ${url}\n` : ""}You are receiving this because you enabled email notifications in AdmitFlow settings.`,
              html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
                <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px;border-radius:12px 12px 0 0;text-align:center">
                  <h1 style="color:white;margin:0;font-size:20px">AdmitFlow</h1>
                </div>
                <div style="border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 12px 12px">
                  <h2 style="margin-top:0;color:#111827;font-size:18px">${title}</h2>
                  <p style="color:#4b5563;line-height:1.6">${message || title}</p>
                  ${url ? `<a href="${url}" style="display:inline-block;background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;margin-top:12px">View Details</a>` : ""}
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
                  <p style="color:#9ca3af;font-size:12px;margin:0">You received this because email notifications are enabled in your AdmitFlow settings.</p>
                </div>
              </div>`,
            });
            emailsSent++;
          } catch (err) {
            console.error(`Email send failed for ${recipient.email}:`, err);
          }
        }
      }
    }

    return NextResponse.json({ notified, pushSent, emailsSent, totalUsers: users.length });
  } catch (err) {
    console.error("Broadcast error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
