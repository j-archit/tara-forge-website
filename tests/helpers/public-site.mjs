import { cp, symlink } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import { spawn, spawnSync } from "node:child_process";

const repo = fileURLToPath(new URL("../../", import.meta.url));
export async function startFixtureWebsite(root) {
  for (const name of ["src", "public", "package.json", "next.config.ts", "postcss.config.mjs", "tsconfig.json"]) await cp(join(repo, name), join(root, name), { recursive: true });
  await symlink(join(repo, "node_modules"), join(root, "node_modules"), process.platform === "win32" ? "junction" : "dir");
  const port = await new Promise((resolve, reject) => {
    const server = createServer(); server.once("error", reject);
    server.listen(0, "127.0.0.1", () => { const port = server.address().port; server.close(() => resolve(port)); });
  });
  const child = spawn(process.execPath, [join(repo, "node_modules", "next", "dist", "bin", "next"), "dev", "--webpack", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  let initialLogs = "";
  function record(data) { if (initialLogs.length < 12000) initialLogs += data; logs = (logs + data).slice(-3000); }
  child.stdout.on("data", record);
  child.stderr.on("data", record);
  let spawnError;
  child.on("error", error => { spawnError = error; });
  const origin = `http://127.0.0.1:${port}`;
  async function close() {
    if (child.exitCode !== null || spawnError) return;
    const exited = new Promise(resolve => child.once("exit", resolve));
    if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
    else child.kill("SIGTERM");
    await exited;
  }
  try {
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null) throw new Error(`Fixture website exited: ${logs}`);
      try { if ((await fetch(`${origin}/gallery/`, { signal: AbortSignal.timeout(15000) })).ok) return { origin, close }; }
      catch { /* Server is still starting. */ }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(`Fixture website did not start: ${initialLogs}\nLatest: ${logs}`);
  } catch (error) { await close(); throw error; }
}
