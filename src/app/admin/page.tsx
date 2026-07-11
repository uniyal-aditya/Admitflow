"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Heart, Download, Bell, Lightbulb, BellDot,
  Building2, FileText, Activity, Loader2, ChevronRight,
  CheckCircle, XCircle, Clock, BookOpen, Shield,
} from "lucide-react";

type Stats = {
  data: {
    colleges: { total: number; byType: Record<string, number>; byOwnership: Record<string, number> };
    notices: { total: number; active: number; byType: Record<string, number> };
  };
  db: {
    users: { total: number; recent: Array<{ id: string; email: string; name: string | null; createdAt: string }> };
    favorites: { total: number; top: Array<{ collegeId: string; _count: number }> };
    downloads: { total: number; recent: Array<{ id: string; noticeTitle: string; collegeName: string; downloadedAt: string }> };
    notifications: { total: number; byType: Array<{ type: string; _count: number }>; read: number; unread: number };
    suggestions: { total: number; pending: number; byStatus: Array<{ status: string; _count: number }>; recent: Array<{ id: string; name: string; type: string; status: string; suggestedAt: string }> };
    pushSubscriptions: number;
  };
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setStats(json);
      setLastUpdated(new Date());
    } catch (e: any) {
      if (!loading) setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500">Failed to load admin dashboard.</p>
      </div>
    );
  }

  const { data, db } = stats;
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const runVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/data/verify");
      if (res.ok) setVerifyResult(await res.json());
    } catch {}
    setVerifying(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Owner-only panel — database & static data overview</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Live"}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Colleges" value={data.colleges.total} color="bg-indigo-600" />
        <StatCard icon={FileText} label="Notices" value={data.notices.total} sub={`${data.notices.active} active`} color="bg-purple-600" />
        <StatCard icon={Users} label="Users" value={db.users.total} color="bg-blue-600" />
        <StatCard icon={Heart} label="Favorites" value={db.favorites.total} color="bg-rose-600" />
        <StatCard icon={Download} label="Downloads" value={db.downloads.total} color="bg-emerald-600" />
        <StatCard icon={Bell} label="Notifications" value={db.notifications.total} sub={`${db.notifications.unread} unread`} color="bg-amber-600" />
        <StatCard icon={Lightbulb} label="Suggestions" value={db.suggestions.total} sub={`${db.suggestions.pending} pending`} color="bg-teal-600" />
        <StatCard icon={BellDot} label="Push Subs" value={db.pushSubscriptions} color="bg-cyan-600" />
      </div>

      {/* Data Verification */}
      <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> AI Data Verification</h2>
          <div className="flex items-center gap-2">
            {verifyResult?.lastVerified && (
              <span className="text-xs text-gray-400">Last: {new Date(verifyResult.lastVerified).toLocaleTimeString()}</span>
            )}
            <button onClick={runVerify} disabled={verifying} className="text-xs rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 disabled:opacity-50">
              {verifying ? "Verifying..." : "Run Check"}
            </button>
          </div>
        </div>
        {verifyResult && (
          <div className="text-sm space-y-2">
            <div className="flex gap-4 text-xs">
              <span className="text-green-600">{verifyResult.verifiedOk || 0} items verified OK</span>
              <span className="text-amber-600">{verifyResult.issues?.length || 0} issues found</span>
              <span className="text-gray-500">{verifyResult.collegesChecked || 0} colleges · {verifyResult.noticesChecked || 0} notices</span>
            </div>
            {verifyResult.issues?.length > 0 && (
              <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 space-y-2">
                {verifyResult.issues.slice(0, 5).map((issue: any, i: number) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium">{issue.item}</span> — {issue.issue}
                    {issue.suggestedFix && <span className="text-indigo-600"> → {issue.suggestedFix}</span>}
                  </div>
                ))}
              </div>
            )}
            {verifyResult.sourcesChecked?.length > 0 && (
              <div className="text-xs text-gray-400">Sources: {verifyResult.sourcesChecked.join(", ")}</div>
            )}
          </div>
        )}
        {!verifyResult && !verifying && (
          <p className="text-xs text-gray-400">Click "Run Check" to verify college/notice/timeline data accuracy using AI.</p>
        )}
      </div>

      {/* Data Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Colleges Breakdown */}
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="font-semibold flex items-center gap-2 mb-4"><Building2 className="h-4 w-4" /> Colleges</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">By Type</span><span>{Object.entries(data.colleges.byType).map(([k, v]) => `${k}: ${v}`).join(" | ")}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">By Ownership</span><span>{Object.entries(data.colleges.byOwnership).map(([k, v]) => `${k}: ${v}`).join(" | ")}</span></div>
          </div>
        </div>

        {/* Notices Breakdown */}
        <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="font-semibold flex items-center gap-2 mb-4"><FileText className="h-4 w-4" /> Notices</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span>{data.notices.total}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Active</span><span className="text-green-600">{data.notices.active}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">By Type</span><span>{Object.entries(data.notices.byType).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(" | ")}</span></div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="p-5 border-b dark:border-gray-800">
          <h2 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">Email</th>
                <th className="text-left p-3 font-medium text-gray-500">Name</th>
                <th className="text-left p-3 font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {db.users.recent.map((u) => (
                <tr key={u.id} className="border-t dark:border-gray-800">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-gray-500">{u.name || "—"}</td>
                  <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Downloads */}
      <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="p-5 border-b dark:border-gray-800">
          <h2 className="font-semibold flex items-center gap-2"><Download className="h-4 w-4" /> Recent Downloads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">Notice</th>
                <th className="text-left p-3 font-medium text-gray-500">College</th>
                <th className="text-left p-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {db.downloads.recent.map((d) => (
                <tr key={d.id} className="border-t dark:border-gray-800">
                  <td className="p-3">{d.noticeTitle}</td>
                  <td className="p-3 text-gray-500">{d.collegeName}</td>
                  <td className="p-3 text-gray-500">{new Date(d.downloadedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="p-5 border-b dark:border-gray-800">
          <h2 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Recent Suggestions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">College</th>
                <th className="text-left p-3 font-medium text-gray-500">Type</th>
                <th className="text-left p-3 font-medium text-gray-500">Status</th>
                <th className="text-left p-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {db.suggestions.recent.map((s) => (
                <tr key={s.id} className="border-t dark:border-gray-800">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3 text-gray-500">{s.type}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      s.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {s.status === "approved" ? <CheckCircle className="h-3 w-3" /> :
                       s.status === "rejected" ? <XCircle className="h-3 w-3" /> :
                       <Clock className="h-3 w-3" />}
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">{new Date(s.suggestedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications Overview */}
      <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="p-5 border-b dark:border-gray-800">
          <h2 className="font-semibold flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{db.notifications.total}</p>
              <p className="text-xs text-gray-500">Total Sent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{db.notifications.read}</p>
              <p className="text-xs text-gray-500">Read</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{db.notifications.unread}</p>
              <p className="text-xs text-gray-500">Unread</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{db.notifications.byType.length}</p>
              <p className="text-xs text-gray-500">Types</p>
            </div>
          </div>
          {db.notifications.byType.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">By Type</p>
              <div className="space-y-1 text-sm">
                {db.notifications.byType.map((n) => (
                  <div key={n.type} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{n.type}</span>
                    <span className="font-medium">{n._count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
