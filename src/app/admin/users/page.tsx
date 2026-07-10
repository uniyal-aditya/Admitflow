"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Smartphone, Bell, CalendarDays } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  _count: { pushSubscriptions: number; notifications: number };
  settings: { emailNotifications: boolean; deviceNotifications: boolean } | null;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 401) { router.push("/"); return; }
      if (!res.ok) throw new Error("Failed");
      setUsers(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const pushSubscribed = users.filter((u) => u._count.pushSubscriptions > 0).length;
  const emailEnabled = users.filter((u) => u.settings?.emailNotifications).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          {users.length} total &middot; {pushSubscribed} push subscribed &middot; {emailEnabled} email enabled
        </p>
      </div>

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
    </div>
  );
}
