"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MarqueeBanner } from "@/components/MarqueeBanner";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const hideFooter = pathname.startsWith("/admin");
  const hideBanner = pathname.startsWith("/admin") || pathname === "/login";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {!hideBanner && <MarqueeBanner />}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto pb-20 animate-fade-in">
          {children}
        </main>
      </div>
      {!hideFooter && (
        <footer className="border-t py-4 px-6 text-xs text-gray-400 dark:border-gray-800">
          <div className="flex items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/tos" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
          </div>
        </footer>
      )}
    </div>
  );
}
