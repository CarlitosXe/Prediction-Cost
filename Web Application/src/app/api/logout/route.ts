import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.APP_URL)
  );
  response.cookies.set("session", "", {
    maxAge: 0,
    path: "/",
  });
  return response;
}
