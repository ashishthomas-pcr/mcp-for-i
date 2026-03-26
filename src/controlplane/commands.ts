import { startControlPlaneServer } from "./server.js";
import { openUrl } from "./platform.js";
import { getControlPlaneUrl } from "./serverShared.js";
import {
  disableBackgroundService,
  enableBackgroundService,
  ensureControlPlaneRunning,
  getServiceStatus
} from "./serviceManager.js";

type RunOptions = {
  defaultCommand?: "serve" | "open";
  scriptPath: string;
  nodePath?: string;
  stderr?: NodeJS.WriteStream;
};

export async function runControlCommand(args: string[], options: RunOptions) {
  const stderr = options.stderr || process.stderr;
  const command = normalizeCommand(args, options.defaultCommand || "serve");
  const scriptPath = options.scriptPath;
  const nodePath = options.nodePath || process.execPath;

  switch (command) {
    case "serve":
      await serve(stderr);
      return;
    case "status":
      await printStatus(stderr, scriptPath, nodePath);
      return;
    case "open":
      await openControlUi(stderr, scriptPath, nodePath);
      return;
    case "enable":
      await enableService(stderr, scriptPath, nodePath);
      return;
    case "disable":
      await disableService(stderr, scriptPath, nodePath);
      return;
    case "help":
    default:
      printHelp(stderr);
      return;
  }
}

async function serve(stderr: NodeJS.WriteStream) {
  try {
    const server = await startControlPlaneServer();
    stderr.write(`mcp-for-i control plane running at http://${server.host}:${server.port}\n`);

    const shutdown = async () => {
      await server.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err: any) {
    if (err?.code === "EADDRINUSE") {
      const url = getControlPlaneUrl();
      stderr.write(`mcp-for-i control plane already running at ${url}\n`);
      process.exit(0);
    }
    throw err;
  }
}

async function printStatus(stderr: NodeJS.WriteStream, scriptPath: string, nodePath: string) {
  const url = getControlPlaneUrl();
  const status = await getServiceStatus(scriptPath, nodePath);

  stderr.write(`Control plane URL: ${url}\n`);
  stderr.write(`Platform: ${status.label} (${status.arch})\n`);
  stderr.write(`Running: ${status.running ? "yes" : "no"}\n`);
  stderr.write(`Background service: ${status.enabled ? "enabled" : "disabled"} via ${status.managedBy}\n`);
  if (status.target) stderr.write(`Target: ${status.target}\n`);
  if (status.detail) stderr.write(`Detail: ${status.detail}\n`);
}

async function openControlUi(stderr: NodeJS.WriteStream, scriptPath: string, nodePath: string) {
  const url = getControlPlaneUrl();
  const result = await ensureControlPlaneRunning(scriptPath, nodePath);
  if (result.started) {
    stderr.write(`Started control plane at ${url}\n`);
  }

  try {
    await openUrl(url);
    stderr.write(`Opening ${url}\n`);
  } catch {
    stderr.write(`Control plane is running at ${url}\n`);
  }
}

async function enableService(stderr: NodeJS.WriteStream, scriptPath: string, nodePath: string) {
  const status = await enableBackgroundService(scriptPath, nodePath);
  await ensureControlPlaneRunning(scriptPath, nodePath);
  stderr.write(`Enabled background service via ${status.managedBy}\n`);
  if (status.target) stderr.write(`Target: ${status.target}\n`);
  if (status.detail) stderr.write(`Detail: ${status.detail}\n`);
}

async function disableService(stderr: NodeJS.WriteStream, scriptPath: string, nodePath: string) {
  const status = await disableBackgroundService(scriptPath, nodePath);
  stderr.write(`Disabled background service (${status.managedBy})\n`);
  if (status.target) stderr.write(`Target: ${status.target}\n`);
}

function printHelp(stderr: NodeJS.WriteStream) {
  stderr.write(`mcp-for-i-control commands:\n`);
  stderr.write(`  serve      Start control plane server in the foreground\n`);
  stderr.write(`  open       Start control plane in the background if needed, then open UI\n`);
  stderr.write(`  status     Show running and background-service status\n`);
  stderr.write(`  enable     Enable background service for this platform\n`);
  stderr.write(`  disable    Disable background service for this platform\n`);
  stderr.write(`  help       Show this help text\n`);
}

function normalizeCommand(args: string[], fallback: "serve" | "open") {
  const first = (args[0] || fallback).toLowerCase();
  if (!first || first === "start") return fallback;
  if (first === "--help" || first === "-h") return "help";
  return first;
}
