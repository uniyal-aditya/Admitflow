import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { AdminSidebar } from "@/components/AdminSidebar";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?redirect=/admin");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isVerifyPage = pathname.includes("/admin/verify-2fa");

  if (!isVerifyPage) {
    const record = await prisma.admin.findUnique({ where: { email: admin.email }, select: { totpSecret: true } });
    if (record?.totpSecret) {
      const cookieStore = headersList.get("cookie") || "";
      const has2FA = cookieStore.split(";").some((c) => c.trim().startsWith("admin_2fa=verified"));
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
