import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
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

async function waitForUrl(url, label, timeoutMs = 300_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the timeout expires.
    }
    await delay(2_000);
  }
  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

function cleanup() {
  runCompose(["down", "-v", "--remove-orphans"]);
}

let keepAliveTimer;
let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
  }
  cleanup();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await shutdown();
    process.exit(0);
  });
}

async function main() {
  cleanup();

  const upResult = runCompose(["up", "--build", "-d", "backend", "frontend"]);
  if (upResult.status !== 0) {
    throw new Error("Unable to start the E2E docker stack.");
  }

  await waitForUrl("http://localhost:8080/api/health", "backend health");
  await waitForUrl("http://localhost:5173/", "frontend");

  console.log("E2E docker stack is ready.");
  keepAliveTimer = setInterval(() => {}, 1_000);
}

main().catch(async error => {
  console.error(error);
  await shutdown();
  process.exit(1);
});
