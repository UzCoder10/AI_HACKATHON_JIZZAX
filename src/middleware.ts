import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/children",
  "/safety",
  "/settings",
  "/subscription",
  "/transparency",
  "/pin",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p);
  const token = request.cookies.get("safarai_session")?.value;

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/children/:path*",
    "/safety/:path*",
    "/settings/:path*",
    "/subscription/:path*",
    "/transparency/:path*",
    "/pin/:path*",
    "/login",
    "/register",
  ],
};
