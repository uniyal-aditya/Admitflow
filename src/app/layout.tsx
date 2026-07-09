import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PixelProvider } from "@/components/PixelProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ChatBot } from "@/components/ChatBot";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <PixelProvider>
            <AuthProvider>
            <NotificationProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto pb-20 animate-fade-in">
                  {children}
                </main>
              </div>
            </div>
            <ChatBot />
          </NotificationProvider>
          </AuthProvider>
          </PixelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
