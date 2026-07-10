import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.email) return null;
  if (session.email === process.env.ADMIN_EMAIL) return { email: session.email, role: "superadmin" };
  const admin = await prisma.admin.findUnique({ where: { email: session.email } });
  if (admin) return { email: admin.email, role: admin.role };
  return null;
}
