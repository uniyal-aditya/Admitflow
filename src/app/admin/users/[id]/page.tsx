"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, Mail, User, Shield, Ban, CheckCircle, AlertTriangle,
  CalendarDays, Smartphone, MessageSquare, Download, Heart, Globe, Edit3,
  Save, X, Clock, Hash, FileText, RefreshCw, MessageCircle
} from "lucide-react";

interface UserDetail {
  id: string; email: string; name: string | null; avatar: string | null;
  phone: string | null; role: string; isBanned: boolean;
  bannedAt: string | null; banReason: string | null;
  lastLoginAt: string | null; createdAt: string; updatedAt: string;
  googleId: string | null;
  _count: { pushSubscriptions: number; notifications: number; downloads: number; favorites: number; posts: number; comments: number };
  settings: { emailNotifications: boolean; deviceNotifications: boolean; language: string; notificationTypes: string } | null;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [saving, setSaving] = useState(false);
  const [banDialog, setBanDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${params.id}`);
      if (res.status === 401) { router.push("/"); return; }
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to fetch"); }
      const d = await res.json();
      setUser(d.user);
      setEditName(d.user.name || "");
      setEditPhone(d.user.phone || "");
      setEditRole(d.user.role);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone, role: editRole }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to save"); }
      const d = await res.json();
      setUser(d.user);
      setEditing(false);
      setSaveMsg({ type: "success", text: "User updated successfully" });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSaveMsg({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleBan = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban: !user?.isBanned, banReason: banReason || undefined }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const d = await res.json();
      setUser(d.user);
      setBanDialog(false);
      setBanReason("");
      setSaveMsg({ type: "success", text: d.user.isBanned ? "User banned" : "User unbanned" });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSaveMsg({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
  );

  if (error) return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="h-4 w-4" />Back</button>
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{error}</div>
    </div>
  );

  if (!user) return null;

  const stats = [
    { label: "Push Subs", value: user._count.pushSubscriptions, icon: Smartphone, color: "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400" },
    { label: "Notifications", value: user._count.notifications, icon: MessageSquare, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400" },
    { label: "Downloads", value: user._count.downloads, icon: Download, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400" },
    { label: "Favorites", value: user._count.favorites, icon: Heart, color: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400" },
    { label: "Posts", value: user._count.posts, icon: FileText, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400" },
    { label: "Comments", value: user._count.comments, icon: MessageCircle, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400" },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/admin/users")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><ArrowLeft className="h-4 w-4" />Back to Users</button>

      {saveMsg && (
        <div className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${saveMsg.type === "success" ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400" : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"}`}>
          {saveMsg.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          {saveMsg.text}
        </div>
      )}

      <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{user.name || "Unnamed"}</h1>
                {user.isBanned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400"><Ban className="h-3 w-3" />Banned</span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.role === "admin" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                  user.role === "moderator" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
                  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  <Shield className="h-3 w-3" />{user.role}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                {user.phone && <span>· {user.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <Edit3 className="h-4 w-4" />{editing ? "Cancel" : "Edit"}
            </button>
            <button onClick={() => { setBanDialog(true); setBanReason(user.banReason || ""); }} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white ${user.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
              {user.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              {user.isBanned ? "Unban" : "Ban"}
            </button>
          </div>
        </div>

        {editing && (
          <div className="mt-6 border-t pt-6 dark:border-gray-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border bg-white p-4 dark:bg-gray-900 dark:border-gray-800">
              <div className={`inline-flex rounded-lg p-2 ${s.color} mb-2`}><Icon className="h-4 w-4" /></div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">User ID</dt><dd className="font-mono text-xs">{user.id}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd>{user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd>{user.name || "\u2014"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd>{user.phone || "\u2014"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Google ID</dt><dd className="font-mono text-xs">{user.googleId || "\u2014"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd className="capitalize">{user.role}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Timeline</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500 flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Joined</dt><dd>{new Date(user.createdAt).toLocaleDateString()}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" />Updated</dt><dd>{new Date(user.updatedAt).toLocaleDateString()}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Last Login</dt><dd>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "\u2014"}</dd></div>
            {user.isBanned && user.bannedAt && (
              <div className="flex justify-between text-red-600"><dt className="flex items-center gap-1.5"><Ban className="h-3.5 w-3.5" />Banned At</dt><dd>{new Date(user.bannedAt).toLocaleDateString()}</dd></div>
            )}
            {user.isBanned && user.banReason && (
              <div className="flex justify-between"><dt className="text-gray-500 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Ban Reason</dt><dd className="text-right max-w-[200px] text-xs">{user.banReason}</dd></div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Notification Settings</h2>
          {user.settings ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Email Notifications</dt><dd>{user.settings.emailNotifications ? <span className="text-green-600 font-medium">Enabled</span> : <span className="text-gray-400">Disabled</span>}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Device Notifications</dt><dd>{user.settings.deviceNotifications ? <span className="text-green-600 font-medium">Enabled</span> : <span className="text-gray-400">Disabled</span>}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Language</dt><dd>{user.settings.language}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Notification Types</dt><dd className="text-xs max-w-[200px] text-right">{user.settings.notificationTypes}</dd></div>
            </dl>
          ) : (
            <p className="text-sm text-gray-400">No settings configured</p>
          )}
        </div>
      </div>

      {banDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setBanDialog(false)}>
          <div className="w-full max-w-md rounded-xl border bg-white p-6 dark:bg-gray-900 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">{user.isBanned ? "Unban User" : "Ban User"}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {user.isBanned
                ? `Remove the ban on ${user.name || user.email}?`
                : `This will prevent ${user.name || user.email} from accessing AdmitFlow.`}
            </p>
            {!user.isBanned && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Reason for ban (optional)</label>
                <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" placeholder="Enter reason..." />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setBanDialog(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={handleBan} disabled={saving} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white ${user.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} disabled:opacity-50`}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                {user.isBanned ? "Unban" : "Ban User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
