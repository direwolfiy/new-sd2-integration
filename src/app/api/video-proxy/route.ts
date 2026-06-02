import { NextRequest } from "next/server";

/**
 * Proxy video downloads to bypass CORS restrictions.
 * GET /api/video-proxy?url=<encoded OSS URL>
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Only allow proxying to known OSS domains
  const parsed = new URL(url);
  if (!parsed.hostname.includes("aliyuncs.com") && !parsed.hostname.includes("lingify")) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(60000),
    });

    const status = response.status;
    if (!response.ok || !response.body) {
      return new Response(`Upstream returned ${status}`, { status });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") ?? "video/mp4");
    headers.set("Content-Length", response.headers.get("Content-Length") ?? "");
    headers.set("Cache-Control", "public, max-age=86400");

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch {
    return new Response("Proxy error", { status: 502 });
  }
}
