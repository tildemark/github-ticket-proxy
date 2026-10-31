import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect client dashboard and tickets
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/tickets")) {
    if (!session) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin & agent portal
  if (pathname.startsWith("/admin") || pathname.startsWith("/agent")) {
    if (!session) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = session.user?.role;
    if (role !== "ADMIN" && role !== "AGENT") {
      // Forbidden for standard clients
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:path*",
    "/admin/:path*",
    "/agent/:path*",
  ],
};
