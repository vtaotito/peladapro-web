import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/groups", "/profile", "/rankings", "/notifications", "/explore"];
const authPaths = ["/login", "/register"];
const ADMIN_COOKIE = "peladapro_admin_session";

function adminHost(hostname: string): boolean {
  const h = hostname.split(":")[0].toLowerCase();
  return (
    h === "admin.peladapro.cloud" ||
    (h.startsWith("admin.") && h.endsWith("peladapro.cloud")) ||
    h === "admin.localhost" ||
    h.startsWith("admin.localhost.")
  );
}

function isSkippableAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    /\.(ico|png|jpg|jpeg|svg|webp|woff2?|txt|json)$/i.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const session = request.cookies.get("peladapro_session")?.value;
  const adminSession = request.cookies.get(ADMIN_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const onAdminSubdomain = adminHost(host);

  /** Tráfego em admin.peladapro.cloud: só rotas /admin e assets. */
  if (onAdminSubdomain) {
    if (isSkippableAsset(pathname)) {
      return NextResponse.next();
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      ["/login", "/register", "/dashboard"].some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
      )
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const isAdminLogin = pathname === "/admin/login";
    if (!isAdminLogin && !adminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isAdminLogin && adminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminRoute && !isAdminLogin && !adminSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminLogin && adminSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
