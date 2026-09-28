import { createServer } from "node:http";
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createStore, ContentError, MAX_IMAGE_BYTES } from "./storage.mjs";
import { createPublisher } from "./publish.mjs";

const UI_ROOT = new URL("./ui/", import.meta.url);
const MAX_BODY = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 1024;
// Covers 200 maximum-sized entries, even with six-byte JSON-escaped characters.
// Keep a finite transport bound in addition to the schema's per-field limits.
export const MAX_SAVE_BODY = 4 * 1024 * 1024;
const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'";

export async function startContentManager({ repoRoot, port = 4317, previewOrigin = null }) {
  const store = await createStore(repoRoot);
  const publisher = createPublisher(store);
  const token = randomBytes(32).toString("hex");
  let origin;
  let uploading = false;
  let saving = false;
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
        if (pathname === "/api/config" && request.method === "GET") return json(response, { previewOrigin });
        if (pathname === "/api/publish/review" && request.method === "GET") return json(response, await publisher.review());
        if (pathname === "/api/publish" && request.method === "POST") {
          if (saving || uploading) throw new ContentError("A save or upload is in progress. Please retry after it finishes.", 409);
          const body = await readJson(request, 512);
          if (saving || uploading) throw new ContentError("A save or upload is in progress. Please retry after it finishes.", 409);
          if (Object.keys(body).length !== 1 || typeof body.reviewId !== "string") throw new ContentError("A publish review is required.");
          return json(response, await publisher.publish(body.reviewId));
        }
        if (match && request.method === "GET") return json(response, await store.load(match[1]));
        if (match && request.method === "PUT") {
          if (publisher.isPublishing()) throw new ContentError("Publishing is in progress. Please retry after it finishes.", 409);
          if (saving) throw new ContentError("Another save is in progress. Please retry.", 409);
          saving = true;
          try {
            const body = await readJson(request, MAX_SAVE_BODY);
            if (Object.keys(body).some(key => !["document", "revision"].includes(key))) throw new ContentError("Unsupported save fields");
            return json(response, await store.save(match[1], body.document, body.revision));
          } finally { saving = false; }
        }
        if (pathname === "/api/upload" && request.method === "POST") {
          if (publisher.isPublishing()) throw new ContentError("Publishing is in progress. Please retry after it finishes.", 409);
          if (uploading) throw new ContentError("An image is already processing. Please retry.", 429);
          uploading = true;
          try {
            const body = await readJson(request, MAX_BODY);
            // A repeated four-character regex group can overflow V8's stack on
            // ordinary multi-megabyte photos. Validate the alphabet linearly.
            if (Object.keys(body).some(key => key !== "data") || typeof body.data !== "string" || body.data.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.data)) throw new ContentError("Invalid image payload");
            return json(response, await store.upload(Buffer.from(body.data, "base64")));
          } finally { uploading = false; }
        }
        throw new ContentError("Unknown API route or method", 404);
      }
      if (request.method !== "GET") throw new ContentError("Method not allowed", 405);
      const files = { "/": ["index.html", "text/html; charset=utf-8"], "/app.js": ["app.js", "text/javascript; charset=utf-8"], "/schema.js": ["../schema.mjs", "text/javascript; charset=utf-8"], "/logo.svg": ["../../../public/Logo.svg", "image/svg+xml"], "/style.css": ["style.css", "text/css; charset=utf-8"] };
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
  const listen = selected => new Promise((resolve, reject) => {
    const fail = error => { server.off("listening", ready); reject(error); };
    const ready = () => { server.off("error", fail); origin = `http://127.0.0.1:${server.address().port}`; resolve(); };
    server.once("error", fail);
    server.once("listening", ready);
    server.listen(selected, "127.0.0.1");
  });
  if (port !== 0) await listen(port);
  else {
    // Browser/Node fetch rejects certain OS-chosen ephemeral ports. Test and
    // embedded callers get a loopback-only port from a fetch-safe range.
    let bound = false;
    for (let attempt = 0; attempt < 20 && !bound; attempt++) {
      try { await listen(randomInt(43000, 49000)); bound = true; }
      catch (error) { if (error.code !== "EADDRINUSE") throw error; }
    }
    if (!bound) throw new ContentError("No local editor port is available.", 503);
  }
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
