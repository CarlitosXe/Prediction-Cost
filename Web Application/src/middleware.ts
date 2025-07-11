import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";

const protectedRoutes = ["/dashboard", "/icd", "/obat"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoutes = protectedRoutes.includes(path);
  const isPublicRoutes = publicRoutes.includes(path);

  const getCookie = cookies(); // ⛔ tidak perlu await, ini bukan async
  // const cookie = req.cookies.get("session")?.value; // ✅ pakai req.cookies langsung

  let session = null;
  try {
    // Get the cookie and decrypt it if it exists
    const cookie = req.cookies.get("session")?.value;
    if (cookie) {
      session = await decrypt(cookie);
    }
  } catch (error) {
    console.error("Error decrypting session:", error);
    // Continue with null session on error
  }

  // ⛔ Blokir akses ke "/"
  if (path === "/") {
    const redirectTo = session?.userId ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(redirectTo, req.nextUrl));
  }

  if (isProtectedRoutes && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoutes && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}
