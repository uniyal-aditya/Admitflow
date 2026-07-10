"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Smartphone, Bell, CalendarDays, Globe, Monitor, User } from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  _count: { pushSubscriptions: number; notifications: number };
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

export default function UsersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "visitors">("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (tab === "users") {
        const res = await fetch("/api/admin/users");
        if (res.status === 401) { router.push("/"); return; }
        if (res.ok) setUsers(await res.json());
      } else {
        const res = await fetch("/api/admin/visitors");
        if (res.status === 401) { router.push("/"); return; }
        if (res.ok) setVisitors(await res.json());
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  const pushSubscribed = users.filter((u) => u._count.pushSubscriptions > 0).length;
  const emailEnabled = users.filter((u) => u.settings?.emailNotifications).length;
  const pwaVisitors = visitors.filter((v) => v.isPwaUser).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registered Users &amp; Visitors</h1>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === "users" ? "bg-white dark:bg-gray-900 border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account Users ({users.length})
          </span>
        </button>
        <button
          onClick={() => setTab("visitors")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === "visitors" ? "bg-white dark:bg-gray-900 border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Visitors ({visitors.length}){pwaVisitors > 0 && <span className="text-xs text-gray-400 ml-1">&middot; {pwaVisitors} PWA</span>}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : tab === "users" ? (
        <>
          <p className="text-sm text-gray-500">
            {users.length} total &middot; {pushSubscribed} push subscribed &middot; {emailEnabled} email enabled
          </p>
          {users.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No users found</div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Push</th>
                    <th className="px-4 py-3 font-medium">Email Notifs</th>
                    <th className="px-4 py-3 font-medium">Notifs</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.name || "\u2014"}</td>
                      <td className="px-4 py-3">
                        {u._count.pushSubscriptions > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-950/30 dark:text-green-400">
                            <Smartphone className="h-3 w-3" />
                            {u._count.pushSubscriptions}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">\u2014</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.settings?.emailNotifications ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full dark:bg-green-950/30 dark:text-green-400">
                            <Mail className="h-3 w-3" />
                            On
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Off</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{u._count.notifications}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {visitors.length} total &middot; {pwaVisitors} installed PWA &middot; {visitors.length - pwaVisitors} browser
          </p>
          {visitors.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No visitors yet</div>
          ) : (
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
                      <td className="px-4 py-3 font-medium">{v.name}</td>
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
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
