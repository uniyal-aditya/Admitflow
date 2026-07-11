import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";
import { notices } from "@/data/notices";
import { sendPushToUser } from "@/lib/webpush";
import nodemailer from "nodemailer";

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
        await sendPushToUser(
          user.pushSubscriptions.map((s) => ({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth })),
          { title: notice.title, body: notice.summary || notice.title, url: `/notices/${notice.id}` }
        );
      }
    }

    if (settings.emailNotifications && user.email) {
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      if (smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          auth: { user: smtpUser, pass: smtpPass },
        });

        const noticeList = matching.slice(0, 5).map((n) =>
          `<li><a href="${process.env.NEXT_PUBLIC_URL || "https://admitflowin.vercel.app"}/notices/${n.id}" style="color:#4f46e5">${n.title}</a></li>`
        ).join("");

        await transporter.sendMail({
          from: `"AdmitFlow" <${process.env.SMTP_FROM || smtpUser}>`,
          to: user.email,
          subject: `New notices match your preferences (${matching.length})`,
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px;border-radius:12px 12px 0 0;text-align:center">
              <h1 style="color:white;margin:0;font-size:20px">AdmitFlow</h1>
            </div>
            <div style="border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 12px 12px">
              <h2 style="margin-top:0;color:#111827;font-size:18px">${matching.length} new notice${matching.length > 1 ? "s" : ""} for you</h2>
              <ul>${noticeList}</ul>
              ${matching.length > 5 ? `<p style="color:#6b7280">...and ${matching.length - 5} more</p>` : ""}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
              <p style="color:#9ca3af;font-size:12px;margin:0">Manage preferences in AdmitFlow settings.</p>
            </div>
          </div>`,
        });
      }
    }

    return NextResponse.json({ ok: true, newNotifications: matching.length });
  } catch (err) {
    console.error("Notification check error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
