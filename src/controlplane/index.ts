#!/usr/bin/env node
import { startControlPlaneServer } from "./server.js";
import { getControlPlaneUrl, isControlPlaneRunning } from "./serverShared.js";
import { getPlatformDescriptor, openUrl } from "./platform.js";

const command = normalizeCommand(process.argv.slice(2));

switch (command) {
  case "serve":
    await serve();
    break;
  case "status":
    await printStatus();
    break;
  case "open":
    await openUi();
    break;
  case "help":
  default:
    printHelp();
    break;
}

async function serve() {
  try {
    const server = await startControlPlaneServer();
    process.stderr.write(`mcp-for-i control plane running at http://${server.host}:${server.port}\n`);

    const shutdown = async () => {
      await server.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err: any) {
    if (err?.code === "EADDRINUSE") {
      const url = getControlPlaneUrl();
      process.stderr.write(`mcp-for-i control plane already running at ${url}\n`);
      process.exit(0);
    }
    throw err;
  }
}

async function printStatus() {
  const url = getControlPlaneUrl();
  const running = await isControlPlaneRunning(url);
  const platform = getPlatformDescriptor();

  process.stderr.write(`Control plane URL: ${url}\n`);
  process.stderr.write(`Platform: ${platform.label} (${platform.arch})\n`);
  process.stderr.write(`Running: ${running ? "yes" : "no"}\n`);
}

async function openUi() {
  const url = getControlPlaneUrl();
  await openUrl(url);
  process.stderr.write(`Opening ${url}\n`);
}

function printHelp() {
  process.stderr.write(`mcp-for-i-control commands:\n`);
  process.stderr.write(`  serve      Start control plane server (foreground)\n`);
  process.stderr.write(`  status     Show running status and current platform\n`);
  process.stderr.write(`  open       Open UI URL in default browser\n`);
}

function normalizeCommand(args: string[]) {
  const first = (args[0] || "serve").toLowerCase();
  if (!first || first === "start") return "serve";
  return first;
}
