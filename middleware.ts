import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Prüfe nur geschützte Routen
  const { pathname } = request.nextUrl;

  // Öffentliche Routen, die keine Authentifizierung benötigen
  const publicRoutes = ["/", "/auth", "/api/auth"];

  // TODO: CHECKEN OB DAS SINN MACHT
  // /tournaments und /tournaments/[id] sollen immer geschützt sein
  const protectedTournaments =
    pathname === "/tournaments" || pathname.startsWith("/tournaments/");

  // Wenn es eine öffentliche Route ist und KEINE geschützte Tournament-Route, lass sie durch
  if (!protectedTournaments && publicRoutes.some((route) => pathname.startsWith(route))) {
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
