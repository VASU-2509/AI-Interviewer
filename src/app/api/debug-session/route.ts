import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  const cookieHeader = req.headers.get("cookie");

  return NextResponse.json({
    receivedCookieHeader: cookieHeader,
    session,
  });
}