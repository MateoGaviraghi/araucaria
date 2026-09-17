import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/config";

// C-06: an optimistic redirect when the cookie is absent. No database, no access decision:
// requireAdmin() decides on every admin page and action.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login" || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
