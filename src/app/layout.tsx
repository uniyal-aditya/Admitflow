import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ChatBot } from "@/components/ChatBot";
import "./globals.css";

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-noto-sans", display: "swap" });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-noto-serif", display: "swap" });

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
      <body className={`${notoSans.variable} ${notoSerif.variable} font-sans`}>
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
