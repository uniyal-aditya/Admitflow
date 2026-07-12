"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Heart, Download, Bell, Lightbulb, BellDot,
  Building2, FileText, Activity, Loader2, ChevronRight,
  CheckCircle, XCircle, Clock, BookOpen, Shield,
  AlertTriangle, BarChart3, RefreshCw, Radio, Pause, Play,
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
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [fixingIssue, setFixingIssue] = useState<string | null>(null);
  const [autoVerify, setAutoVerify] = useState(true);
  const [nextVerifyIn, setNextVerifyIn] = useState(300);
  const [liveStatus, setLiveStatus] = useState<"connected" | "error">("connected");
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!mountedRef.current) return;
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (!mountedRef.current) return;
      setStats(json);
      setLastUpdated(new Date());
      setLiveStatus("connected");
    } catch (e: any) {
      if (mountedRef.current) setError(e.message);
      setLiveStatus("error");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [router]);

  const runVerify = useCallback(async () => {
    setVerifying(true);
    setNextVerifyIn(300);
    try {
      const res = await fetch("/api/data/verify");
      if (res.ok) {
        const data = await res.json();
        setVerifyResult(data);
        await fetch("/api/admin/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ai_verify",
            details: `Auto-verification: ${data.verifiedOk || 0} OK, ${data.issues?.length || 0} issues, ${data.totalChecked || 0} items`,
          }),
        });
      }
    } catch (err) {
      console.error("Verify error:", err);
    }
    setVerifying(false);
  }, []);

  useEffect(() => {
    fetchStats();
    const statsInterval = setInterval(fetchStats, 30000);
    return () => clearInterval(statsInterval);
  }, [fetchStats]);

  useEffect(() => {
    if (!autoVerify) return;
    const verifyInterval = setInterval(runVerify, 300000);
    return () => clearInterval(verifyInterval);
  }, [autoVerify, runVerify]);

  useEffect(() => {
    if (!autoVerify || verifying) return;
    const interval = setInterval(() => {
      setNextVerifyIn((prev) => (prev <= 1 ? 300 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [autoVerify, verifying]);

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

  const applyFix = async (issue: any) => {
    setFixingIssue(issue.id || issue.item);
    try {
      const res = await fetch("/api/data/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: issue.id,
          field: issue.field,
          suggestedFix: issue.suggestedFix,
          category: issue.category,
          item: issue.item,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Fix failed:", err.error);
        return;
      }

      setVerifyResult((prev: any) => ({
        ...prev,
        issues: prev.issues.filter((i: any) => i.id !== issue.id || i.item !== issue.item),
        verifiedOk: (prev.verifiedOk || 0) + 1,
      }));
    } catch (err) {
      console.error("Apply fix error:", err);
    }
    setFixingIssue(null);
  };

  const minutes = Math.floor(nextVerifyIn / 60);
  const seconds = nextVerifyIn % 60;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Live Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${liveStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-sm font-medium">{liveStatus === "connected" ? "Live" : "Disconnected"}</span>
          </div>
          <div className="text-xs text-gray-400">
            Stats: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Radio className={`h-3.5 w-3.5 ${autoVerify ? "text-indigo-500" : "text-gray-300"}`} />
            AI Auto-Check: {autoVerify ? `${minutes}:${seconds.toString().padStart(2, "0")}` : "Paused"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runVerify}
            disabled={verifying}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${verifying ? "animate-spin" : ""}`} />
            {verifying ? "Checking..." : "Verify Now"}
          </button>
          <button
            onClick={() => setAutoVerify(!autoVerify)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              autoVerify
                ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {autoVerify ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {autoVerify ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Owner-only panel — database & static data overview</p>
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

      {/* AI Data Verification */}
      <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> AI Data Verification</h2>
            {autoVerify && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400">
                <Radio className="h-3 w-3" />
                Auto every 5 min
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {verifying && (
              <span className="text-xs text-indigo-600 flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking...
              </span>
            )}
            {verifyResult?.lastVerified && (
              <span className="text-xs text-gray-400">
                {autoVerify ? `Next: ${minutes}:${seconds.toString().padStart(2, "0")}` : `Last: ${new Date(verifyResult.lastVerified).toLocaleTimeString()}`}
              </span>
            )}
            <button
              onClick={runVerify}
              disabled={verifying}
              className="text-xs rounded-lg bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              {verifying ? "Verifying..." : "Check Now"}
            </button>
          </div>
        </div>

        {verifyResult && (
          <div className="space-y-4">
            {/* Summary bar */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-3.5 w-3.5" /> {verifyResult.verifiedOk || 0} verified OK
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" /> {(verifyResult.issues?.length || 0)} issues
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                <BarChart3 className="h-3.5 w-3.5" /> {verifyResult.totalChecked || 0} items checked
              </span>
            </div>

            {/* Issues list with Apply Fix */}
            {verifyResult.issues?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Issues Found:</p>
                {verifyResult.issues.map((issue: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3 text-sm dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          issue.category === "college" ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" :
                          issue.category === "notice" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                          "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400"
                        }`}>
                          {issue.category || "general"}
                        </span>
                        <span className="font-medium truncate">{issue.item}</span>
                      </div>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">{issue.issue}</p>
                      {issue.suggestedFix && (
                        <p className="mt-0.5 text-indigo-600 dark:text-indigo-400 text-xs">
                          Suggested fix: {issue.suggestedFix}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => applyFix(issue)}
                      disabled={fixingIssue === (issue.id || issue.item)}
                      className="shrink-0 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                    >
                      {fixingIssue === (issue.id || issue.item) ? "Fixing..." : "Apply Fix"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {verifyResult.issues?.length === 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">All data verified OK</p>
                  <p className="text-xs text-green-600 dark:text-green-500">No issues found in any college, notice, or timeline data.</p>
                </div>
              </div>
            )}

            {verifyResult.sourcesChecked?.length > 0 && (
              <div className="text-xs text-gray-400">Sources: {verifyResult.sourcesChecked.join(", ")}</div>
            )}
          </div>
        )}

        {!verifyResult && !verifying && (
          <p className="text-xs text-gray-400">
            {autoVerify
              ? `Auto-verification runs every 5 minutes. First check in ${minutes}:${seconds.toString().padStart(2, "0")}...`
              : 'Click "Check Now" to verify ALL college, notice, and timeline data using AI.'}
          </p>
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
