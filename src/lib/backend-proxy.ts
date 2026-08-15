import "server-only";

const FORWARDED_REQUEST_HEADERS = [
  "content-type",
  "cookie",
  "idempotency-key",
  "x-csrf-token",
] as const;

const FORWARDED_RESPONSE_HEADERS = ["content-type", "cache-control"] as const;

export async function proxyToBackend(request: Request, path: string): Promise<Response> {
  const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
  const target = new URL(path, backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`);
  target.search = new URL(request.url).search;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
  let backendResponse: Response;
  try {
    backendResponse = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (error) {
    console.error("[Backend proxy] Service unavailable", error);
    return Response.json({ detail: "Application service is temporarily unavailable" }, { status: 503 });
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = backendResponse.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const cookieHeaders = backendResponse.headers.getSetCookie?.() ?? [];
  for (const cookie of cookieHeaders) responseHeaders.append("set-cookie", cookie);

  return new Response(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}
