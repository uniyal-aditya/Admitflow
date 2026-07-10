import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ChatBot } from "@/components/ChatBot";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdmitFlow - Uttarakhand College Admission Companion",
  description:
    "Never miss a college admission opportunity. AdmitFlow collects, organizes, and displays admission information from Uttarakhand government colleges in one place.",
  manifest: "/manifest.json",
  keywords: [
    "Uttarakhand admissions", "government colleges", "JEE counselling",
    "UKTech", "Doon University", "GBPIET", "college admission",
  ],
};

import { LayoutShell } from "@/components/LayoutShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
          <NotificationProvider>
          <LayoutShell>{children}</LayoutShell>
          <ChatBot />
        </NotificationProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
