"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Shield } from "lucide-react";

const STANDALONE = ["/", "/about", "/login", "/privacy", "/tos"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE.includes(pathname);
  const isAdmin = pathname.startsWith("/admin");
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false);

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <MarqueeBanner />
      <div className="flex flex-1">
        <Sidebar />
        {isAdmin && (
          <>
            <button
              onClick={() => setAdminSidebarOpen(true)}
              className="lg:hidden fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              aria-label="Open admin menu"
            >
              <Shield size={20} />
            </button>
            <AdminSidebar open={adminSidebarOpen} onClose={() => setAdminSidebarOpen(false)} />
          </>
        )}
        <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-auto pb-24 ${isAdmin ? "lg:ml-0" : ""}`}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {!isAdmin && (
        <footer className="border-t py-4 px-6 text-xs text-gray-400 dark:border-gray-800">
          <div className="flex items-center justify-center gap-4">
            <Link href="/about" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
          </div>
        </footer>
      )}
    </div>
  );
}
