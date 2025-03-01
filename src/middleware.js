import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // Jika tidak ada token dan bukan di halaman login, redirect ke login
  if (!token && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika ada token, cek role
  if (token) {
    const userRole = token.role;
    const roleAccess = {
      Owner: ["/", "/cashier", "/products", "/account"],
      Admin: ["/", "/account"],
      Karyawan: ["/cashier"],
    };

    const allowedPaths = roleAccess[userRole] || [];
    const isAllowed = allowedPaths.includes(pathname); // <- Menggunakan includes

    const existingPaths = [
      "/",
      "/cashier",
      "/products",
      "/account",
      "/login",
      "/forbidden",
    ];

    if (!existingPaths.includes(pathname)) {
      return NextResponse.rewrite(new URL("/404", req.url));
    }

    if (!isAllowed && pathname !== "/forbidden" && pathname !== "/login") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico|images/).*)"],
};
