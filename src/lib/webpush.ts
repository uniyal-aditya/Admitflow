import webpush from "web-push";

let initialized = false;
function ensureVapid() {
  if (initialized) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  const subject = process.env.VAPID_SUBJECT || "mailto:admitflow@example.com";
  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    initialized = true;
  }
}

export function getVapidPublicKey(): string {
  return process.env.VAPID_PUBLIC_KEY || "";
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string }
) {
  ensureVapid();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      return false;
    }
    console.error("Push send error:", err);
    return false;
  }
}

export async function sendPushToUser(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; url?: string }
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );
  return results.map((r) => r.status === "fulfilled" ? r.value : false);
}

export async function sendPushWithCleanup(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; url?: string },
  onStale: (endpoint: string) => void
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value === false) {
      onStale(subscriptions[i].endpoint);
    }
  });
}
