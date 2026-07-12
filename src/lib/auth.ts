  import { SignJWT, jwtVerify } from "jose";
  import { cookies } from "next/headers";
  import type { Role } from "@prisma/client";

  export interface SessionUser {
    id: string;
    name: string;
    role: Role;
  }

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "laundry-secret-key"
  );

  const COOKIE_NAME = "laundry-session";

  export async function createSession(user: SessionUser) {
    const token = await new SignJWT({
      id: user.id,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, secret);
      return payload as unknown as SessionUser;
    } catch {
      return null;
    }
  }

  export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  }

  export async function requireAuth(allowedRoles?: Role[]) {
    const session = await getSession();
    if (!session) return null;
    if (allowedRoles && !allowedRoles.includes(session.role)) return null;
    return session;
  }
