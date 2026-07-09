import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addSubscription, removeSubscription } from "@/lib/push-store";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { endpoint, p256dh, auth } = await req.json();
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Missing subscription fields" }, { status: 400 });
    }

    await addSubscription(session.id, endpoint, p256dh, auth);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }
    await removeSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
