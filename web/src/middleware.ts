import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/groups", "/profile", "/rankings", "/notifications", "/explore"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("peladapro_session")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isAuth = authPaths.some((p) => pathname === p);

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/groups/:path*", "/profile/:path*", "/rankings/:path*", "/notifications/:path*", "/login", "/register"],
};
