import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "rb_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export type Session = { userId: string; name: string; role: "ADMIN" | "STAFF" };

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET manquant dans le fichier .env");
  return new TextEncoder().encode(secret);
}

export async function createSession(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_NAME);
}

// Tout utilisateur connecté (admin ou personnel)
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

// Administrateur uniquement
export async function requireAdmin() {
  const session = await requireUser();
  if (session.role !== "ADMIN") redirect("/admin");
  return session;
}