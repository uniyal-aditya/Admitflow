import { AdminSidebar } from "@/components/AdminSidebar";
import { requireAdmin } from "@/lib/admin";
import { notFound } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  return <AdminSidebar>{children}</AdminSidebar>;
}
