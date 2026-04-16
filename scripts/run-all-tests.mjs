import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

await run("node", ["scripts/run-backend.mjs", "test"]);
await run(npmCommand, ["--prefix", "frontend", "run", "test:unit"]);
await run("node", ["scripts/run-backend.mjs", "verify"]);
await run(npmCommand, ["--prefix", "frontend", "run", "test:e2e"]);
