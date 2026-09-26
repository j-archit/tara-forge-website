import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { startContentManager } from "./server.mjs";

try {
  const manager = await startContentManager({ repoRoot: fileURLToPath(new URL("../../", import.meta.url)) });
  console.log(`\nTaraForge3D content manager launch link (keep private):\n${manager.launchUrl}\nSave writes local Git changes only. Ctrl+C stops the editor.\n`);
  if (!process.argv.includes("--no-open")) {
    const command = process.platform === "win32" ? "powershell.exe" : process.platform === "darwin" ? "open" : "xdg-open";
    const args = process.platform === "win32" ? ["-NoProfile", "-NonInteractive", "-Command", `Start-Process -FilePath '${manager.launchUrl}' -WindowStyle Hidden`] : [manager.launchUrl];
    execFile(command, args, { windowsHide: true }, error => { if (error) console.log("Browser could not open automatically. Open the URL above."); });
  }
  for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, async () => { await manager.close(); process.exit(0); });
} catch (error) {
  console.error(error.code === "EADDRINUSE" ? "Port 4317 is in use. Stop the existing editor before starting another." : error.message);
  process.exitCode = 1;
}
