import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = path.join(rootDir, "backend");
const goal = process.argv[2] ?? "test";
const command = process.platform === "win32" ? "mvnw.cmd" : "./mvnw";

const child = spawn(command, [goal], {
  cwd: backendDir,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
