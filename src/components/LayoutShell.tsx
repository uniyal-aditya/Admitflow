"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { UtilityBar } from "@/components/gov/UtilityBar";
import { SiteHeader } from "@/components/gov/SiteHeader";
import { NoticeTicker } from "@/components/gov/NoticeTicker";
import { SiteFooter } from "@/components/gov/SiteFooter";
import { GuidedTour } from "@/components/gov/GuidedTour";

/** Pages that render with no site chrome at all. */
const BARE = ["/login"];
/** Pages that manage their own width (full-bleed sections). */
const FULL_BLEED = ["/"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (BARE.includes(pathname)) return <>{children}</>;

  // Admin keeps its own console chrome (Navbar + admin sidebar from /admin/layout).
  if (pathname.startsWith("/admin")) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <MarqueeBanner />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    );
  }

  const fullBleed = FULL_BLEED.includes(pathname);
  return (
    <div className="flex min-h-screen flex-col">
      <UtilityBar />
      <SiteHeader />
      <NoticeTicker />
      <main id="main-content" className={fullBleed ? "flex-1" : "mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-16 md:px-6 md:py-8"}>
        {children}
      </main>
      <SiteFooter />
      <GuidedTour />
    </div>
  );
}
