"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Send, Bell, Mail, Smartphone, Users, Megaphone, X } from "lucide-react";

const noticeTypes = ["admission", "registration", "counselling", "spot_round", "vacant_seat", "merit_list", "waiting_list", "fee_payment", "reporting", "extension", "general"];

const tabs = [
  { id: "push", label: "Push Notification", icon: Smartphone },
  { id: "email", label: "Email Notification", icon: Mail },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("push");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ notified: number; pushSent: number; emailsSent: number; totalUsers: number } | null>(null);
  const [error, setError] = useState("");

  const [userStats, setUserStats] = useState({ total: 0, push: 0, email: 0 });
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [collegeName, setCollegeName] = useState("");
  const [url, setUrl] = useState("");

  const [bannerMsg, setBannerMsg] = useState("");
  const [bannerSubmitting, setBannerSubmitting] = useState(false);
  const [bannerResult, setBannerResult] = useState("");
  const [activeBanners, setActiveBanners] = useState<any[]>([]);

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
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      const res = await fetch("/api/admin/banner");
      const data = await res.json();
      if (Array.isArray(data)) setActiveBanners(data);
    } catch {}
  }

  async function handleAddBanner() {
    if (!bannerMsg.trim()) return;
    setBannerSubmitting(true);
    setBannerResult("");
    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: bannerMsg.trim() }),
      });
      if (res.status === 401) { router.push("/"); return; }
      if (!res.ok) throw new Error("Failed");
      setBannerMsg("");
      setBannerResult("Banner added!");
      await fetchBanners();
    } catch { setBannerResult("Failed to add banner"); }
    finally { setBannerSubmitting(false); }
  }

  async function handleRemoveBanner(id: string) {
    try {
      await fetch(`/api/admin/banner/${id}`, { method: "DELETE" });
      await fetchBanners();
    } catch {}
  }

  async function handleClearAll() {
    try {
      await fetch("/api/admin/banner", { method: "DELETE" });
      await fetchBanners();
      setBannerResult("All banners cleared");
    } catch {}
  }

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
          channels: { push: activeTab === "push", email: activeTab === "email" },
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Broadcast Notification
        </h1>
        <p className="text-sm text-gray-500 mt-1">Send notifications to all users</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">{error}</motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <p className="font-medium mb-1">Sent successfully!</p>
          <p>Notified: {result.notified} users | {result.pushSent > 0 && `Push sent: ${result.pushSent} |`} {result.emailsSent > 0 && `Emails sent: ${result.emailsSent} |`} (of {result.totalUsers} total users)</p>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Total Users", value: userStats.total, color: "text-gray-400" },
          { icon: Smartphone, label: "Push Subscribed", value: userStats.push, color: "text-indigo-400" },
          { icon: Mail, label: "Email Enabled", value: userStats.email, color: "text-amber-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-lg border bg-white p-4 text-center dark:bg-gray-900 dark:border-gray-800">
            <s.icon className={`h-5 w-5 mx-auto ${s.color} mb-1`} />
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1 rounded-xl border bg-gray-100 p-1 dark:bg-gray-800 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-900 dark:text-indigo-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <motion.form
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSend}
        className="rounded-xl border bg-white p-6 space-y-5 dark:bg-gray-900 dark:border-gray-800"
      >
        <div className="flex items-center gap-2 mb-1">
          {activeTab === "push" ? <Smartphone className="h-5 w-5 text-indigo-500" /> : <Mail className="h-5 w-5 text-amber-500" />}
          <h2 className="font-semibold">{activeTab === "push" ? "Push Notification" : "Email Notification"}</h2>
        </div>

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

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? "Sending..." : `Send ${activeTab === "push" ? "Push" : "Email"}`}
          </button>
        </div>

        <div className="rounded-lg border p-4 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-2">Preview</p>
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
      </motion.form>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Megaphone className="h-5 w-5" />
          Site Banners
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          {activeBanners.length > 0
            ? `${activeBanners.length} banner${activeBanners.length > 1 ? "s" : ""} active · marquee speed adjusts automatically`
            : "No active banners"}
        </p>

        {activeBanners.length > 0 && (
          <div className="mb-4 space-y-2">
            {activeBanners.map((b: any) => (
              <div key={b.id} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 text-sm dark:from-indigo-950/30 dark:to-purple-950/30">
                <Megaphone className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span className="flex-1 truncate">{b.message}</span>
                <button
                  onClick={() => handleRemoveBanner(b.id)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {activeBanners.length > 1 && (
              <button onClick={handleClearAll} className="text-xs text-red-500 hover:underline mt-1">
                Clear all banners
              </button>
            )}
          </div>
        )}

        {bannerResult && <p className="text-sm text-green-600 mb-2">{bannerResult}</p>}
        <div className="flex gap-2">
          <input
            type="text"
            value={bannerMsg}
            onChange={(e) => setBannerMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddBanner(); }}
            placeholder="Enter banner announcement text..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={handleAddBanner}
            disabled={bannerSubmitting || !bannerMsg.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {bannerSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
