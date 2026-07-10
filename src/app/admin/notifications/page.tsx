"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Bell, Mail, Smartphone, Users } from "lucide-react";

const noticeTypes = ["admission", "registration", "counselling", "spot_round", "vacant_seat", "merit_list", "waiting_list", "fee_payment", "reporting", "extension", "general"];

export default function NotificationsPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ notified: number; pushSent: number; emailsSent: number; totalUsers: number } | null>(null);
  const [error, setError] = useState("");

  const [userStats, setUserStats] = useState({ total: 0, push: 0, email: 0 });
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [collegeName, setCollegeName] = useState("");
  const [url, setUrl] = useState("");
  const [pushChannel, setPushChannel] = useState(true);
  const [emailChannel, setEmailChannel] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setUserStats({
            total: data.length,
            push: data.filter((u) => u._count?.pushSubscriptions > 0).length,
            email: data.filter((u) => u.settings?.emailNotifications).length,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          collegeName: collegeName.trim() || "AdmitFlow",
          url: url.trim() || undefined,
          channels: { push: pushChannel, email: emailChannel },
        }),
      });
      if (res.status === 401) { router.push("/"); return; }
      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();
      setResult(data);
      setTitle(""); setMessage(""); setCollegeName(""); setUrl("");
    } catch {
      setError("Failed to send notification");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Broadcast Notification
        </h1>
        <p className="text-sm text-gray-500 mt-1">Send a notification to all users via push and/or email</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">{error}</div>
      )}

      {result && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <p className="font-medium mb-1">Notification sent successfully!</p>
          <p>Notified: {result.notified} users | Push sent: {result.pushSent} | Emails sent: {result.emailsSent} (of {result.totalUsers} total users)</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center dark:bg-gray-900 dark:border-gray-800">
          <Users className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-lg font-bold">{userStats.total}</p>
          <p className="text-xs text-gray-500">Total Users</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center dark:bg-gray-900 dark:border-gray-800">
          <Smartphone className="h-5 w-5 mx-auto text-indigo-400 mb-1" />
          <p className="text-lg font-bold">{userStats.push}</p>
          <p className="text-xs text-gray-500">Push Subscribed</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center dark:bg-gray-900 dark:border-gray-800">
          <Mail className="h-5 w-5 mx-auto text-amber-400 mb-1" />
          <p className="text-lg font-bold">{userStats.email}</p>
          <p className="text-xs text-gray-500">Email Enabled</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="rounded-xl border bg-white p-6 space-y-5 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Spot Round Started at GBPIET"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Notification body text..."
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700 resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            >
              {noticeTypes.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">College Name</label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="AdmitFlow"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Link URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://admitflowin.vercel.app/notices (optional)"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Delivery Channels</label>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer has-checked:bg-indigo-50 has-checked:border-indigo-300 dark:has-checked:bg-indigo-950/30 dark:has-checked:border-indigo-700">
              <input type="checkbox" checked={pushChannel} onChange={(e) => setPushChannel(e.target.checked)} className="rounded" />
              <Smartphone className="h-4 w-4" />
              <span className="text-sm">Push</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer has-checked:bg-indigo-50 has-checked:border-indigo-300 dark:has-checked:bg-indigo-950/30 dark:has-checked:border-indigo-700">
              <input type="checkbox" checked={emailChannel} onChange={(e) => setEmailChannel(e.target.checked)} className="rounded" />
              <Mail className="h-4 w-4" />
              <span className="text-sm">Email</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>

      <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="font-semibold mb-2">Preview</h2>
        <div className="rounded-lg border p-4 max-w-sm dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-950">
              <Bell className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">{collegeName || "AdmitFlow"} · {type.replace(/_/g, " ")}</p>
              <p className="text-sm font-medium mt-0.5">{title || "Notification title"}</p>
              {message && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{message}</p>}
              {url && <p className="text-xs text-indigo-600 mt-1 truncate">{url}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
