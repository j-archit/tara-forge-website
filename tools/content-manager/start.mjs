import { execFile, spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { startContentManager } from "./server.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
async function freePort() {
  const socket = createServer();
  await new Promise((resolve, reject) => socket.once("error", reject).listen(0, "127.0.0.1", resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}
async function startPreview() {
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  for (const stream of [child.stdout, child.stderr]) stream.on("data", bytes => { output = `${output}${bytes}`.slice(-2000); });
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline && child.exitCode === null) {
    try { const response = await fetch(`${origin}/gallery/`, { signal: AbortSignal.timeout(3000) }); if (response.ok) return { child, origin }; }
    catch { /* Next may still be compiling. */ }
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  const existing = /You can access the existing server at (http:\/\/127\.0\.0\.1:\d+)/.exec(output)?.[1];
  if (existing) {
    try {
      const response = await fetch(`${existing}/gallery/`, { signal: AbortSignal.timeout(3000) });
      if (response.ok && (await response.text()).includes("TaraForge")) { child.kill(); return { child: null, origin: existing }; }
    } catch { /* A stale local preview is not reusable. */ }
  }
  child.kill();
  throw new Error(`Website preview did not start. ${output.slice(-500)}`);
}

let preview = null;
try {
  if (!process.argv.includes("--no-preview")) {
    console.log("Starting local website preview…");
    try { preview = await startPreview(); }
    catch (error) { console.warn(`${error.message}\nThe editor will still open; start npm run dev separately if you need a preview.`); }
  }
  const manager = await startContentManager({ repoRoot: root, previewOrigin: preview?.origin });
  console.log(`\nTaraForge3D content manager launch link (keep private):\n${manager.launchUrl}\n${preview ? `Website preview: ${preview.origin}` : "Website preview is not running."}\nSave writes locally; Publish commits and pushes managed content from main. Ctrl+C stops the editor.\n`);
  if (!process.argv.includes("--no-open")) {
    const command = process.platform === "win32" ? "powershell.exe" : process.platform === "darwin" ? "open" : "xdg-open";
    const args = process.platform === "win32" ? ["-NoProfile", "-NonInteractive", "-Command", `Start-Process -FilePath '${manager.launchUrl}' -WindowStyle Hidden`] : [manager.launchUrl];
    execFile(command, args, { windowsHide: true }, error => { if (error) console.log("Browser could not open automatically. Open the URL above."); });
  }
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, async () => { await manager.close(); preview?.child?.kill(); process.exit(0); });
} catch (error) {
  preview?.child?.kill();
  console.error(error.code === "EADDRINUSE" ? "Port 4317 is in use. Stop the existing editor before starting another." : error.message);
  process.exitCode = 1;
}
