import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createStore, ContentError, MAX_IMAGE_BYTES } from "./storage.mjs";

const UI_ROOT = new URL("./ui/", import.meta.url);
const MAX_BODY = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 1024;
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";

export async function startContentManager({ repoRoot, port = 4317 }) {
  const store = await createStore(repoRoot);
  const token = randomBytes(32).toString("hex");
  let origin;
  let uploading = false;
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Security-Policy", CSP);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    try {
      // Host checks also stop DNS rebinding; no forwarded headers are trusted.
      if (request.headers.host !== new URL(origin).host || (request.headers.origin && request.headers.origin !== origin) || ["cross-site", "same-site"].includes(request.headers["sec-fetch-site"])) throw new ContentError("Local same-origin access only", 403);
      const pathname = new URL(request.url, origin).pathname;
      if (pathname.startsWith("/api/")) {
        const supplied = Buffer.from(String(request.headers["x-content-token"] ?? ""));
        const expected = Buffer.from(token);
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new ContentError("Invalid editor session. Open the current private launch link.", 403);
        const match = /^\/api\/content\/(gallery|products)$/.exec(pathname);
        if (match && request.method === "GET") return json(response, await store.load(match[1]));
        if (match && request.method === "PUT") {
          const body = await readJson(request, 512 * 1024);
          if (Object.keys(body).some(key => !["document", "revision"].includes(key))) throw new ContentError("Unsupported save fields");
          return json(response, await store.save(match[1], body.document, body.revision));
        }
        if (pathname === "/api/upload" && request.method === "POST") {
          if (uploading) throw new ContentError("An image is already processing. Please retry.", 429);
          uploading = true;
          try {
            const body = await readJson(request, MAX_BODY);
            if (Object.keys(body).some(key => key !== "data") || typeof body.data !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body.data)) throw new ContentError("Invalid image payload");
            return json(response, await store.upload(Buffer.from(body.data, "base64")));
          } finally { uploading = false; }
        }
        throw new ContentError("Unknown API route or method", 404);
      }
      if (request.method !== "GET") throw new ContentError("Method not allowed", 405);
      const files = { "/": ["index.html", "text/html; charset=utf-8"], "/app.js": ["app.js", "text/javascript; charset=utf-8"], "/style.css": ["style.css", "text/css; charset=utf-8"] };
      if (Object.hasOwn(files, pathname)) {
        const [name, type] = files[pathname];
        const bytes = await readFile(new URL(name, UI_ROOT));
        response.writeHead(200, { "Content-Type": type }).end(bytes);
        return;
      }
      if (/^\/images\/content\/[a-f0-9]{64}\.webp$/.test(pathname)) {
        const bytes = await readFile(await store.asset(pathname));
        response.writeHead(200, { "Content-Type": "image/webp" }).end(bytes);
        return;
      }
      throw new ContentError("Not found", 404);
    } catch (error) {
      if (response.headersSent) { response.end(); return; }
      const status = error instanceof ContentError ? error.status : error.code === "ENOENT" ? 404 : error instanceof SyntaxError ? 400 : 400;
      // Validation messages are useful; OS errors must not leak local paths.
      const message = error.code ? "File unavailable. Check the content and asset files." : error.message || "Request failed";
      json(response, { error: message }, status);
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.maxHeadersCount = 50;
  server.maxConnections = 32;
  server.maxRequestsPerSocket = 100;
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => { origin = `http://127.0.0.1:${server.address().port}`; resolve(); });
  });
  return { origin, token, launchUrl: `${origin}/#session=${token}`, store, close: async () => { server.closeAllConnections(); await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); } };
}

function json(response, value, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(value));
}

async function readJson(request, limit) {
  if (request.headers["content-type"] !== "application/json") throw new ContentError("JSON content type required", 415);
  if (Number(request.headers["content-length"]) > limit) throw new ContentError("Request is too large", 413);
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new ContentError("Request is too large", 413);
    chunks.push(chunk);
  }
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ContentError("JSON object required");
  return body;
}
