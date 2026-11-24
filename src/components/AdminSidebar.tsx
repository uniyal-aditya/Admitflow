"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Building2,
  FileText,
  Lightbulb,
  Shield,
  Bell,
  X,
  Users,
  ScrollText,
  MessageCircle,
  Globe,
  Star,
  BadgeCheck,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Content", href: "/admin/content", icon: Globe },
  { label: "Colleges", href: "/admin/colleges", icon: Building2 },
  { label: "Notices", href: "/admin/notices", icon: FileText },
  { label: "Verification", href: "/admin/verification", icon: BadgeCheck },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Community", href: "/admin/community", icon: MessageCircle },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Suggestions", href: "/admin/suggestions", icon: Lightbulb },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
  { label: "Security", href: "/admin/security", icon: Shield },
  { label: "Admins", href: "/admin/admins", icon: Users },
]

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    onClose()
  }, [pathname])

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r flex flex-col transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b shrink-0 dark:border-gray-800">
          <span className="text-sm font-bold text-blue-600">AdmitFlow Admin</span>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
