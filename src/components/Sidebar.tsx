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
  Info,
  LayoutDashboard,
  Lightbulb,
  Shield,
} from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/colleges", label: "College Profiles", icon: BookOpen },
  { href: "/notices", label: "Notice Center", icon: Bell },
  { href: "/search", label: "Search", icon: Search },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/suggest", label: "Suggest College", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

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
      <div className="mt-auto border-t p-4 dark:border-gray-800">
        <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white text-sm">
          <p className="font-semibold">AdmitFlow v1.0</p>
          <p className="mt-1 text-xs opacity-80">Uttarakhand College Admission Companion</p>
        </div>
      </div>
    </aside>
  );
}
