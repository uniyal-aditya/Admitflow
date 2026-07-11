import { AdminSidebar } from "@/components/AdminSidebar";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?redirect=/admin");

  return <AdminSidebar>{children}</AdminSidebar>;
}
