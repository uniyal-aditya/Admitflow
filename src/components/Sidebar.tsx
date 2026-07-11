"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Bell,
  Search,
  BarChart3,
  CalendarDays,
  Star,
  Settings,
  LayoutDashboard,
  Lightbulb,
  Shield,
  User,
  LogOut,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/colleges", label: "College Profiles", icon: BookOpen },
  { href: "/notices", label: "Notice Center", icon: Bell },
  { href: "/community", label: "Community", icon: MessageCircle },
  { href: "/search", label: "Search", icon: Search },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/suggest", label: "Suggest College", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },

];

export function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.admin))
      .catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-gray-50/50 dark:bg-gray-950/50 dark:border-gray-800 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex flex-col gap-1 p-4">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mt-2 border-t pt-3 dark:border-gray-800 ${
              pathname.startsWith("/admin")
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </div>
      <div className="mt-auto border-t dark:border-gray-800">
        {user && (
          <div className="p-4">
            <Link href="/profile" className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold shrink-0">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 rounded-lg px-2 py-2 mt-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
