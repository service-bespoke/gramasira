import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const user = request.cookies.get("user");

  const pathname = request.nextUrl.pathname;

  // Allow login page
  if (pathname === "/login") {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // Protect all other pages
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/customers/:path*",
    "/readings/:path*",
    "/bills/:path*",
    "/payments/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/funds/:path*",
    "/tariff/:path*",
    "/import/:path*",
  ],
};
