// src/lib/session.tsx
import "server-only";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.NEXTAUTH_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: string;
  expiresAt: Date;
};

export async function createSession(
  userId: string,
  name: string,
  email: string,
  role: string,
  rememberMe: boolean = false
) {
  const durationMs = rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 hari
    : 24 * 60 * 60 * 1000; // 1 hari

  const expiresAt = new Date(Date.now() + durationMs);
  const session = await encrypt({ userId, name, email, role, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("failed to verify session");
  }
}

