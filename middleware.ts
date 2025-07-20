import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Prüfe nur geschützte Routen
  const { pathname } = request.nextUrl;

  // Öffentliche Routen, die keine Authentifizierung benötigen
  const publicRoutes = ["/", "/auth", "/api/auth"];

  // Wenn es eine öffentliche Route ist, lass sie durch
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Für geschützte Routen: Prüfe auf Session-Cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    // Keine Session gefunden, weiterleitung zur Login-Seite
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Alle Pfade außer:
     * - API-Routen (außer /api/auth)
     * - _next/static (statische Dateien)
     * - _next/image (Bildoptimierung)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
