import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

async function proxy(req: NextRequest, params: Promise<{ path: string[] }>): Promise<Response> {
  const { path } = await params;
  const url = `${BACKEND_URL}/api/${path.join("/")}`;

  const existingUserId = req.cookies.get("anon_user_id")?.value;
  const userId = existingUserId ?? crypto.randomUUID();

  const headers = new Headers();
  if (req.headers.get("content-type")) {
    headers.set("content-type", req.headers.get("content-type")!);
  }
  headers.set("x-user-id", userId);

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text();
    if (body) init.body = body;
  }

  const upstream = await fetch(url, init);

  const setCookieIfNeeded = (res: NextResponse) => {
    if (!existingUserId) {
      res.cookies.set("anon_user_id", userId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  };

  // Stream SSE responses directly
  if (upstream.headers.get("content-type")?.includes("text/event-stream")) {
    const res = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      },
    });
    return setCookieIfNeeded(res);
  }

  const data = await upstream.text();
  const res = new NextResponse(data || null, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
  return setCookieIfNeeded(res);
}

export const GET = (req: NextRequest, context: { params: Promise<{ path: string[] }> }) =>
  proxy(req, context.params);
export const POST = (req: NextRequest, context: { params: Promise<{ path: string[] }> }) =>
  proxy(req, context.params);
export const PUT = (req: NextRequest, context: { params: Promise<{ path: string[] }> }) =>
  proxy(req, context.params);
export const PATCH = (req: NextRequest, context: { params: Promise<{ path: string[] }> }) =>
  proxy(req, context.params);
export const DELETE = (req: NextRequest, context: { params: Promise<{ path: string[] }> }) =>
  proxy(req, context.params);
