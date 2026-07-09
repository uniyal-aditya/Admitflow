import { promises as fs } from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "push-subscriptions.json");

interface PushSubEntry {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
}

async function readStore(): Promise<PushSubEntry[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeStore(data: PushSubEntry[]) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function addSubscription(userId: string, endpoint: string, p256dh: string, auth: string) {
  const subs = await readStore();
  const idx = subs.findIndex((s) => s.endpoint === endpoint);
  const entry: PushSubEntry = { userId, endpoint, p256dh, auth, createdAt: new Date().toISOString() };
  if (idx >= 0) {
    subs[idx] = entry;
  } else {
    subs.push(entry);
  }
  await writeStore(subs);
}

export async function removeSubscription(endpoint: string) {
  const subs = await readStore();
  await writeStore(subs.filter((s) => s.endpoint !== endpoint));
}

export async function getSubscriptionsByUser(userId: string): Promise<PushSubEntry[]> {
  const subs = await readStore();
  return subs.filter((s) => s.userId === userId);
}
