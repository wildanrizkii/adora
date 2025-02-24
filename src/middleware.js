import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  if (!token && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const userRole = token.role;
    const roleAccess = {
      Pemilik: ["/", "/cashier", "/products"],
      Admin: ["/", "/cashier", "/products"],
      Karyawan: ["/cashier"],
    };

    const allowedPaths = roleAccess[userRole] || [];
    const isAllowed = allowedPaths.some((route) => pathname.startsWith(route));

    // Redirect ke /403 jika role tidak sesuai
    if (!isAllowed && pathname !== "/403" && pathname !== "/login") {
      const forbiddenUrl = new URL("/403", req.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico|images/).*)"],
};
