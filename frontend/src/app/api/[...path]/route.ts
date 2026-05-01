import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

async function proxy(req: NextRequest, params: Promise<{ path: string[] }>): Promise<Response> {
  const { path } = await params;
  const url = `${BACKEND_URL}/api/${path.join("/")}`;

  const headers = new Headers();
  if (req.headers.get("content-type")) {
    headers.set("content-type", req.headers.get("content-type")!);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text();
    if (body) init.body = body;
  }

  const upstream = await fetch(url, init);

  // Stream SSE responses directly
  if (upstream.headers.get("content-type")?.includes("text/event-stream")) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      },
    });
  }

  const data = await upstream.text();
  return new NextResponse(data || null, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = (req: NextRequest, context: { params: Promise<{ path: string[] }> }) =>
  proxy(req, context.params);
export const POST = (req: NextRequest, context: { params: Promise<{ path: string[] }> }) =>
  proxy(req, context.params);
export const DELETE = (req: NextRequest, context: { params: Promise<{ path: string[] }> }) =>
  proxy(req, context.params);
