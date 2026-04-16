import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const composeFile = path.join(rootDir, "docker-compose.yml");
const composeArgs = process.argv.slice(2);

function resolveComposeCommand() {
  const candidates = [
    { command: "docker", prefix: ["compose"] },
    { command: "docker-compose", prefix: [] },
  ];

  for (const candidate of candidates) {
    const probeArgs = [...candidate.prefix, "version"];
    const result = spawnSync(candidate.command, probeArgs, {
      cwd: rootDir,
      stdio: "ignore",
      shell: false,
    });
    if (result.status === 0) {
      return candidate;
    }
  }

  throw new Error("Neither 'docker compose' nor 'docker-compose' is available on this machine.");
}

const compose = resolveComposeCommand();
const child = spawn(
  compose.command,
  [...compose.prefix, "-f", composeFile, ...composeArgs],
  {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
