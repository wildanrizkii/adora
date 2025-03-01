import { NextResponse } from "next/server";

export async function GET(req) {
  const userAgent = req.headers.get("user-agent") || "Unknown";

  return NextResponse.json({ userAgent }, { status: 200 });
}
