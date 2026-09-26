import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Explicit migration verification; do not permanently freeze CMS data on main.
const child = spawn(process.execPath, [fileURLToPath(new URL("../../node_modules/@playwright/test/cli.js", import.meta.url)), "test", ...process.argv.slice(2)], {
  cwd: fileURLToPath(new URL("../../", import.meta.url)),
  env: { ...process.env, VERIFY_DESIGN_COPY: "1" },
  stdio: "inherit",
  windowsHide: true,
});
child.on("error", error => { console.error(error.message); process.exitCode = 1; });
child.on("exit", (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
