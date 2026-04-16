import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const composeFile = path.join(rootDir, "docker-compose.yml");

function resolveComposeCommand() {
  const candidates = [
    { command: "docker", prefix: ["compose"] },
    { command: "docker-compose", prefix: [] },
  ];

  for (const candidate of candidates) {
    const result = spawnSync(candidate.command, [...candidate.prefix, "version"], {
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
const baseArgs = [...compose.prefix, "-f", composeFile];

function runCompose(args, stdio = "inherit") {
  return spawnSync(compose.command, [...baseArgs, ...args], {
    cwd: rootDir,
    stdio,
    shell: false,
  });
}

function cleanup() {
  runCompose(["down", "-v", "--remove-orphans"]);
}

cleanup();

const child = spawn(compose.command, [...baseArgs, "up", "--build", "postgres", "backend", "frontend"], {
  cwd: rootDir,
  stdio: "inherit",
  shell: false,
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  if (child.exitCode === null) {
    child.kill(signal);
  }
  cleanup();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(signal));
}

child.on("exit", (code) => {
  cleanup();
  process.exit(code ?? 1);
});
