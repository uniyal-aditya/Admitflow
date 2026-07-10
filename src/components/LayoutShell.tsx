"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isLanding = pathname === "/" && !loading && !user;

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto pb-20 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
