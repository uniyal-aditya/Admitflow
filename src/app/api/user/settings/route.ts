import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function serialize(s: {
  notificationTypes: string;
  scanFrequency: number;
  language: string;
  emailNotifications: boolean;
  deviceNotifications: boolean;
}) {
  return {
    notificationTypes: s.notificationTypes.split(","),
    scanFrequency: s.scanFrequency,
    language: s.language,
    emailNotifications: s.emailNotifications,
    deviceNotifications: s.deviceNotifications,
  };
}

const VALID_TYPES = new Set([
  "admission", "registration", "counselling", "spot_round", "vacant_seat",
  "merit_list", "waiting_list", "fee_payment", "reporting", "extension", "general",
]);

export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.id },
    });
    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId: session.id } });
    }
    return NextResponse.json({ settings: serialize(settings) });
  } catch (err) {
    console.error("GET settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const data: {
      notificationTypes?: string;
      scanFrequency?: number;
      language?: string;
      emailNotifications?: boolean;
      deviceNotifications?: boolean;
    } = {};

    if (body.notificationTypes !== undefined) {
      if (
        !Array.isArray(body.notificationTypes) ||
        body.notificationTypes.some((t: unknown) => !VALID_TYPES.has(String(t)))
      ) {
        return NextResponse.json({ error: "Invalid notificationTypes" }, { status: 400 });
      }
      data.notificationTypes = [...new Set(body.notificationTypes.map(String))].join(",");
    }
    if (body.scanFrequency !== undefined) {
      const n = Number(body.scanFrequency);
      if (!Number.isInteger(n) || n < 1 || n > 168) {
        return NextResponse.json({ error: "scanFrequency must be 1-168 hours" }, { status: 400 });
      }
      data.scanFrequency = n;
    }
    if (body.language !== undefined) {
      if (typeof body.language !== "string" || body.language.length > 10) {
        return NextResponse.json({ error: "Invalid language" }, { status: 400 });
      }
      data.language = body.language;
    }
    if (body.emailNotifications !== undefined) {
      data.emailNotifications = Boolean(body.emailNotifications);
    }
    if (body.deviceNotifications !== undefined) {
      data.deviceNotifications = Boolean(body.deviceNotifications);
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.id },
      create: { userId: session.id, ...data },
      update: data,
    });

    return NextResponse.json({ settings: serialize(settings) });
  } catch (err) {
    console.error("PUT settings error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
