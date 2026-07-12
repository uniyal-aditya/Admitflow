import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  keywords: [
    "Uttarakhand admissions", "government colleges", "JEE counselling",
    "UKTech", "Doon University", "GBPIET", "college admission",
  ],
};

import { LayoutShell } from "@/components/LayoutShell";
import { RegistrationPopup } from "@/components/RegistrationPopup";
import { ReviewPopup } from "@/components/ReviewPopup";

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
          <RegistrationPopup />
          <ReviewPopup />
        </NotificationProvider>
        </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
