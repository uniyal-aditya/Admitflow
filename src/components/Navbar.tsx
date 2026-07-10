"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  GraduationCap,
  Menu,
  Search,
  Settings,
  X,
  Moon,
  Sun,
  Download,
  LogIn,
} from "lucide-react";
import { useTheme } from "next-themes";
import { getUnreadCount } from "@/lib/store";
import { useInstallApp } from "@/hooks/useInstallApp";
import { useAuth } from "@/components/AuthProvider";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: GraduationCap },
  { href: "/colleges", label: "Colleges", icon: BookOpen },
  { href: "/notices", label: "Notices", icon: Bell },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = getUnreadCount();
  const { canInstall, install } = useInstallApp();
  const { user, loading, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg dark:bg-gray-950/80 dark:border-gray-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AdmitFlow
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 max-w-[120px] truncate">
                  {user.name || user.email.split("@")[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1"
              >
                Logout
              </button>
            </div>
          ) : !loading ? (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          ) : null}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
            <Moon className="h-5 w-5 absolute inset-0 m-auto rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          <Link
            href="/notices"
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t px-4 py-3 md:hidden bg-white dark:bg-gray-950 dark:border-gray-800">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Logout ({user.name || user.email.split("@")[0]})
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
            {canInstall && (
              <button
                onClick={() => { install(); setMobileOpen(false); }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 transition-colors"
              >
                <Download className="h-4 w-4" />
                Install App
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
