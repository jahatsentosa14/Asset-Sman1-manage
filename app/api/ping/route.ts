import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json({
    ok: true,
    origin: request.headers.get("origin"),
    host: request.headers.get("host"),
    xForwardedHost: request.headers.get("x-forwarded-host"),
  });
}