import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { hasValidAdmin2fa } from "@/lib/admin-2fa";
import { AdminSidebar } from "@/components/AdminSidebar";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin({ allowUnverified2fa: true });
  if (!admin) redirect("/login?redirect=/admin");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isVerifyPage = pathname.includes("/admin/verify-2fa");

  if (!isVerifyPage) {
    const record = await prisma.admin.findUnique({ where: { email: admin.email }, select: { totpSecret: true } });
    if (record?.totpSecret) {
      const has2FA = await hasValidAdmin2fa(admin.email);
      if (!has2FA) {
        redirect("/admin/verify-2fa");
      }
    }
  }

  if (isVerifyPage) {
    return <>{children}</>;
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
