import os from "os";
import { spawn } from "child_process";

export type PlatformDescriptor = {
  platform: NodeJS.Platform;
  arch: string;
  isWsl: boolean;
  label: string;
};

type OpenCommand = {
  command: string;
  args: string[];
};

export function detectWsl(
  platform: NodeJS.Platform = process.platform,
  release = os.release(),
  env: NodeJS.ProcessEnv = process.env
) {
  if (platform !== "linux") return false;
  if (env.WSL_DISTRO_NAME || env.WSL_INTEROP) return true;
  return /microsoft/i.test(release);
}

export function getPlatformDescriptor(
  platform: NodeJS.Platform = process.platform,
  arch = process.arch,
  release = os.release(),
  env: NodeJS.ProcessEnv = process.env
): PlatformDescriptor {
  const isWsl = detectWsl(platform, release, env);
  return {
    platform,
    arch,
    isWsl,
    label: describePlatform(platform, isWsl)
  };
}

export function getOpenUrlCommands(
  url: string,
  descriptor = getPlatformDescriptor()
): OpenCommand[] {
  if (descriptor.platform === "win32") {
    return [
      { command: "rundll32.exe", args: ["url.dll,FileProtocolHandler", url] },
      { command: "explorer.exe", args: [url] }
    ];
  }

  if (descriptor.platform === "darwin") {
    return [{ command: "open", args: [url] }];
  }

  if (descriptor.isWsl) {
    return [
      { command: "wslview", args: [url] },
      { command: "explorer.exe", args: [url] },
      { command: "xdg-open", args: [url] }
    ];
  }

  return [
    { command: "xdg-open", args: [url] },
    { command: "gio", args: ["open", url] }
  ];
}

export async function openUrl(url: string, descriptor = getPlatformDescriptor()) {
  const candidates = getOpenUrlCommands(url, descriptor);
  let lastError: Error | undefined;

  for (const candidate of candidates) {
    try {
      await spawnDetached(candidate.command, candidate.args);
      return candidate.command;
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error(`No browser launcher available for ${descriptor.label}`);
}

function spawnDetached(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true
    });

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

function describePlatform(platform: NodeJS.Platform, isWsl: boolean) {
  if (platform === "win32") return "Windows";
  if (platform === "darwin") return "macOS";
  if (isWsl) return "Linux (WSL)";
  if (platform === "linux") return "Linux";
  return platform;
}
