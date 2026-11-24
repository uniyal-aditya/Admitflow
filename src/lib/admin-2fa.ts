import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_2FA_COOKIE = "admin_2fa";

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET environment variable is required");
  return new TextEncoder().encode(s);
}

/** Signed proof that `email` passed the TOTP check (12h). Cannot be forged by hand-setting a cookie. */
export async function createAdmin2faToken(email: string): Promise<string> {
  return new SignJWT({ email, scope: "admin2fa" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function hasValidAdmin2fa(email: string): Promise<boolean> {
  try {
    const token = (await cookies()).get(ADMIN_2FA_COOKIE)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret());
    return payload.scope === "admin2fa" && payload.email === email;
  } catch {
    return false;
  }
}
