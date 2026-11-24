import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { hasValidAdmin2fa } from "@/lib/admin-2fa";

/**
 * Returns the admin identity or null.
 * If the admin has 2FA enabled, a valid signed 2FA cookie is required too —
 * enforced here so every /api/admin/* route is protected, not just the pages.
 * `allowUnverified2fa` is only for the 2FA status check used by the verify page.
 */
export async function requireAdmin(opts: { allowUnverified2fa?: boolean } = {}) {
  const session = await getSession();
  if (!session?.email) return null;

  const record = await prisma.admin.findUnique({
    where: { email: session.email },
    select: { email: true, role: true, totpSecret: true },
  });

  let identity: { email: string; role: string } | null = null;
  if (session.email === process.env.ADMIN_EMAIL) identity = { email: session.email, role: "superadmin" };
  else if (record) identity = { email: record.email, role: record.role };
  if (!identity) return null;

  if (record?.totpSecret && !opts.allowUnverified2fa) {
    if (!(await hasValidAdmin2fa(identity.email))) return null;
  }
  return identity;
}
