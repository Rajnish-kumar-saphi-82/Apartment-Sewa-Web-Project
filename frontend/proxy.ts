import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register"];
const adminRoutes = ["/admin"];

// Protected routes — add any new protected pages here
const protectedRoutes = ["/dashboard", "/profile"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth token and user data from cookies
  const token = request.cookies.get("auth_token")?.value;
  const userDataCookie = request.cookies.get("user_data")?.value;
  
  let user: { role?: string } | null = null;
  if (userDataCookie) {
    try {
      // Decode URL encoded cookie if necessary
      const decodedCookie = decodeURIComponent(userDataCookie);
      user = JSON.parse(decodedCookie);
    } catch (e) {
      console.error("Failed to parse user_data cookie", e);
    }
  }

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // 1. Unauthenticated user trying to access a protected or admin route -> redirect to login
  if (!token && (isProtectedRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If old cookies are incomplete/corrupt, do not allow protected pages to
  // trap the browser in a login <-> dashboard redirect loop.
  if (token && !user && (isProtectedRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Authenticated user trying to access admin route without Admin role -> redirect to unauthorized
  if (token && user && isAdminRoute && user.role !== "Admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/profile",
    "/register",
    "/login",
    "/admin",
    "/admin/:path*",
  ],
};
