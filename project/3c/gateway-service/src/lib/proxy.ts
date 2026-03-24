import type { Context } from "hono";

/**
 * Builds a set of upstream headers from the incoming request,
 * stripping the `host` header so the upstream resolves its own host.
 */
function buildUpstreamHeaders(c: Context): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(c.req.header())) {
    if (key.toLowerCase() === "host") continue;
    headers.set(key, value);
  }

  return headers;
}

/**
 * Proxies the incoming Hono request to `upstreamUrl`, preserving the
 * method, headers (minus `host`), and body. Streams the upstream response
 * back to the client unchanged.
 */
export async function proxyRequest(
  upstreamUrl: string,
  c: Context,
): Promise<Response> {
  const method = c.req.method;

  // For methods that carry a body, read the raw request body so we can
  // forward it verbatim. GET / HEAD / DELETE with no body → undefined.
  const hasBody = method !== "GET" && method !== "HEAD";
  const body: BodyInit | undefined = hasBody
    ? await c.req.raw.arrayBuffer()
    : undefined;

  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers: buildUpstreamHeaders(c),
    body,
    // Do not follow redirects on behalf of the client — let them handle it.
    redirect: "manual",
  });

  // Build response headers to forward back, stripping hop-by-hop headers.
  const responseHeaders = new Headers();
  const HOP_BY_HOP = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
  ]);

  for (const [key, value] of upstreamResponse.headers.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
