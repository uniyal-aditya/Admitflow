"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, RefreshCw } from "lucide-react";

interface AdminLog {
  id: string;
  action: string;
  details: string | null;
  adminEmail: string | null;
  createdAt: string;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (res.status === 401) { router.push("/"); return; }
      if (res.ok) setLogs(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  async function handleClearLogs() {
    if (!confirm("Clear logs older than 30 days?")) return;
    setClearing(true);
    try {
      const res = await fetch("/api/admin/logs", { method: "DELETE" });
      if (res.ok) fetchLogs();
    } catch {} finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Logs</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleClearLogs}
            disabled={clearing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:bg-red-950/30 dark:hover:bg-red-950/50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {clearing ? "Clearing..." : "Clear Old Logs"}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">{logs.length} recent logs &middot; auto-refreshes every 10s</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No logs found</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Details</th>
                <th className="px-4 py-3 font-medium">Admin</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-gray-500">{log.details || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-500">{log.adminEmail || "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
