"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Mail, Smartphone, Bell, CalendarDays, Globe, Monitor, User,
  Search, Download, ChevronLeft, ChevronRight, Users, Eye, MessageSquare,
  Heart, AlertCircle, Ban, Shield, ExternalLink
} from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string;
  _count: { pushSubscriptions: number; notifications: number; downloads: number; favorites: number };
  settings: { emailNotifications: boolean; deviceNotifications: boolean } | null;
}

interface Visitor {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  referralSource: string | null;
  isPwaUser: boolean;
  userAgent: string | null;
  createdAt: string;
}

interface PageInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "visitors">("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pageInfo, setPageInfo] = useState<PageInfo>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [visitorPageInfo, setVisitorPageInfo] = useState<PageInfo>({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [visitorPage, setVisitorPage] = useState(1);

  const fetchData = useCallback(async (page: number, query: string) => {
    setLoading(true);
    setError("");
    try {
      if (tab === "users") {
        const params = new URLSearchParams({ page: String(page), limit: "20" });
        if (query) params.set("search", query);
        const res = await fetch(`/api/admin/users?${params}`);
        if (res.status === 401) { router.push("/"); return; }
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        setUsers(json.users);
        setPageInfo({ total: json.total, page: json.page, limit: json.limit, totalPages: json.totalPages });
      } else {
        const params = new URLSearchParams({ page: String(page), limit: "50" });
        if (query) params.set("search", query);
        const res = await fetch(`/api/admin/visitors?${params}`);
        if (res.status === 401) { router.push("/"); return; }
        if (!res.ok) throw new Error("Failed to fetch visitors");
        const json = await res.json();
        setVisitors(json.visitors);
        setVisitorPageInfo({ total: json.total, page: json.page, limit: json.limit, totalPages: json.totalPages });
      }
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [tab, router]);

  useEffect(() => {
    const page = tab === "users" ? currentPage : visitorPage;
    fetchData(page, search);
  }, [tab, currentPage, visitorPage, fetchData]);

  const handleSearch = () => {
    setCurrentPage(1);
    setVisitorPage(1);
    fetchData(1, search);
  };

  const exportCSV = () => {
    const rows = tab === "users" ? users : visitors;
    if (rows.length === 0) return;
    const headers = tab === "users"
      ? ["Email", "Name", "Push Subs", "Email Notifs", "Device Notifs", "Notifs", "Downloads", "Favorites", "Joined"]
      : ["Name", "Email", "Phone", "Referral Source", "PWA User", "User Agent", "Date"];
    const csv = [
      headers.join(","),
      ...rows.map((r: any) => {
        if (tab === "users") {
          const u = r as AppUser;
          return [
            `"${u.email}"`, `"${u.name || ""}"`, u._count.pushSubscriptions,
            u.settings?.emailNotifications ? "Yes" : "No", u.settings?.deviceNotifications ? "Yes" : "No",
            u._count.notifications, u._count.downloads, u._count.favorites,
            new Date(u.createdAt).toISOString().split("T")[0],
          ].join(",");
        } else {
          const v = r as Visitor;
          return [
            `"${v.name || ""}"`, `"${v.email || ""}"`, `"${v.phone || ""}"`,
            `"${v.referralSource || ""}"`, v.isPwaUser ? "Yes" : "No",
            `"${(v.userAgent || "").slice(0, 100)}"`, new Date(v.createdAt).toISOString().split("T")[0],
          ].join(",");
        }
      }),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `admitflow-${tab}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pushSubscribed = users.filter((u) => u._count.pushSubscriptions > 0).length;
  const emailEnabled = users.filter((u) => u.settings?.emailNotifications).length;
  const pwaVisitors = visitors.filter((v) => v.isPwaUser).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Userbase</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tab === "users"
              ? `${pageInfo.total} registered users · ${pushSubscribed} push subscribed · ${emailEnabled} email enabled`
              : `${visitorPageInfo.total} total App users · ${pwaVisitors} PWA · ${visitorPageInfo.total - pwaVisitors} web`}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={loading || (tab === "users" ? users.length === 0 : visitors.length === 0)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg border p-1">
          <button
            onClick={() => { setTab("users"); setCurrentPage(1); setSearch(""); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              tab === "users" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="h-4 w-4" />
            Website Users
          </button>
          <button
            onClick={() => { setTab("visitors"); setVisitorPage(1); setSearch(""); }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              tab === "visitors" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Globe className="h-4 w-4" />
            App Users
          </button>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={`Search ${tab === "users" ? "by email or name" : "by name, email, or phone"}...`}
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : tab === "users" ? (
        <>
          {users.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {search ? "No users match your search" : "No users found"}
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-center">Push</th>
                      <th className="px-4 py-3 font-medium text-center">Email</th>
                      <th className="px-4 py-3 font-medium text-center">Device</th>
                      <th className="px-4 py-3 font-medium text-center"><MessageSquare className="h-3.5 w-3.5 inline" /></th>
                      <th className="px-4 py-3 font-medium text-center"><Download className="h-3.5 w-3.5 inline" /></th>
                      <th className="px-4 py-3 font-medium text-center"><Heart className="h-3.5 w-3.5 inline" /></th>
                      <th className="px-4 py-3 font-medium"><CalendarDays className="h-3.5 w-3.5 inline" /></th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => router.push(`/admin/users/${u.id}`)}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{u.name || "\u2014"}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {u.isBanned && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit dark:bg-red-950/30 dark:text-red-400"><Ban className="h-3 w-3" />Banned</span>
                            )}
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                              u.role === "admin" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                              u.role === "moderator" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" :
                              "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}>
                              <User className="h-3 w-3" />{u.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u._count.pushSubscriptions > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-950/30 dark:text-green-400">
                              <Smartphone className="h-3 w-3" />
                              {u._count.pushSubscriptions}
                            </span>
                          ) : <span className="text-xs text-gray-400">\u2014</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.settings?.emailNotifications ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-950/30 dark:text-green-400">
                              <Mail className="h-3 w-3" />On
                            </span>
                          ) : <span className="text-xs text-gray-400">Off</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {u.settings?.deviceNotifications ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-950/30 dark:text-indigo-400">
                              <Bell className="h-3 w-3" />On
                            </span>
                          ) : <span className="text-xs text-gray-400">Off</span>}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">{u._count.notifications}</td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">{u._count.downloads}</td>
                        <td className="px-4 py-3 text-center text-xs text-gray-500">{u._count.favorites}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/${u.id}`); }} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800" title="View details">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pageInfo.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Showing {(pageInfo.page - 1) * pageInfo.limit + 1}-{Math.min(pageInfo.page * pageInfo.limit, pageInfo.total)} of {pageInfo.total}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === pageInfo.totalPages || Math.abs(p - currentPage) <= 2)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">...</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`min-w-[32px] rounded-lg border px-2 py-1 text-sm ${
                              currentPage === p
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "hover:bg-gray-50 dark:border-gray-700"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pageInfo.totalPages, p + 1))}
                      disabled={currentPage >= pageInfo.totalPages}
                      className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {visitors.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {search ? "No visitors match your search" : "No visitors yet"}
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Referred By</th>
                      <th className="px-4 py-3 font-medium">Device</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((v) => (
                      <tr key={v.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium">{v.name || "\u2014"}</td>
                        <td className="px-4 py-3 text-gray-500">{v.email || "\u2014"}</td>
                        <td className="px-4 py-3 text-gray-500">{v.phone || "\u2014"}</td>
                        <td className="px-4 py-3 text-gray-500">{v.referralSource || "\u2014"}</td>
                        <td className="px-4 py-3">
                          {v.isPwaUser ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full dark:bg-indigo-950/30 dark:text-indigo-400">
                              <Monitor className="h-3 w-3" />
                              PWA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Globe className="h-3 w-3" />
                              Web
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visitorPageInfo.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Showing {(visitorPageInfo.page - 1) * visitorPageInfo.limit + 1}-{Math.min(visitorPageInfo.page * visitorPageInfo.limit, visitorPageInfo.total)} of {visitorPageInfo.total}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setVisitorPage((p) => Math.max(1, p - 1))}
                      disabled={visitorPage <= 1}
                      className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: visitorPageInfo.totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === visitorPageInfo.totalPages || Math.abs(p - visitorPage) <= 2)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">...</span>}
                          <button
                            onClick={() => setVisitorPage(p)}
                            className={`min-w-[32px] rounded-lg border px-2 py-1 text-sm ${
                              visitorPage === p
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "hover:bg-gray-50 dark:border-gray-700"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                    <button
                      onClick={() => setVisitorPage((p) => Math.min(visitorPageInfo.totalPages, p + 1))}
                      disabled={visitorPage >= visitorPageInfo.totalPages}
                      className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}