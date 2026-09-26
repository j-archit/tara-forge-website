import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";

// Local static preview only. Never serve repository files or bind publicly.
const root = await realpath(resolve("out"));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".txt": "text/plain", ".xml": "application/xml" };
const server = createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405).end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    file = await realpath(file);
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const contents = await readFile(file);
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "x-content-type-options": "nosniff", "cache-control": "no-store" });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch { response.writeHead(404).end("Not found"); }
});
server.listen(8765, "127.0.0.1", () => console.log("Design preview: http://127.0.0.1:8765"));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { server.closeAllConnections(); server.close(); });
