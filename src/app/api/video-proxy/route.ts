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
    const range = request.headers.get("range");
    const response = await fetch(url, {
      headers: range ? { Range: range } : undefined,
      signal: AbortSignal.timeout(60000),
    });

    const status = response.status;
    if (!response.ok || !response.body) {
      return new Response(`Upstream returned ${status}`, { status });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") ?? "video/mp4");
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const contentRange = response.headers.get("Content-Range");
    if (contentRange) headers.set("Content-Range", contentRange);
    headers.set("Accept-Ranges", response.headers.get("Accept-Ranges") ?? "bytes");
    headers.set("Cache-Control", "public, max-age=86400");

    return new Response(response.body, {
      status: response.status === 206 ? 206 : 200,
      headers,
    });
  } catch {
    return new Response("Proxy error", { status: 502 });
  }
}
