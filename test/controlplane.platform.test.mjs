import test from "node:test";
import assert from "node:assert/strict";
import {
  detectWsl,
  getOpenUrlCommands,
  getPlatformDescriptor
} from "../dist/controlplane/platform.js";

test("detectWsl identifies WSL from environment markers", () => {
  assert.equal(detectWsl("linux", "6.6.87.2-microsoft-standard-WSL2", {}), true);
  assert.equal(detectWsl("linux", "6.6.87.2-generic", { WSL_INTEROP: "/run/WSL/1_interop" }), true);
  assert.equal(detectWsl("linux", "6.6.87.2-generic", {}), false);
  assert.equal(detectWsl("darwin", "23.4.0", {}), false);
});

test("getPlatformDescriptor reports friendly labels", () => {
  const mac = getPlatformDescriptor("darwin", "arm64", "23.4.0", {});
  assert.equal(mac.label, "macOS");

  const windows = getPlatformDescriptor("win32", "x64", "10.0.22631", {});
  assert.equal(windows.label, "Windows");

  const wsl = getPlatformDescriptor("linux", "x64", "6.6.87.2-microsoft-standard-WSL2", {});
  assert.equal(wsl.label, "Linux (WSL)");
});

test("getOpenUrlCommands chooses platform-specific launchers", () => {
  const url = "http://127.0.0.1:3980";

  const windows = getOpenUrlCommands(url, {
    platform: "win32",
    arch: "x64",
    isWsl: false,
    label: "Windows"
  });
  assert.equal(windows[0].command, "rundll32.exe");

  const mac = getOpenUrlCommands(url, {
    platform: "darwin",
    arch: "arm64",
    isWsl: false,
    label: "macOS"
  });
  assert.equal(mac[0].command, "open");

  const linux = getOpenUrlCommands(url, {
    platform: "linux",
    arch: "x64",
    isWsl: false,
    label: "Linux"
  });
  assert.equal(linux[0].command, "xdg-open");

  const wsl = getOpenUrlCommands(url, {
    platform: "linux",
    arch: "x64",
    isWsl: true,
    label: "Linux (WSL)"
  });
  assert.equal(wsl[0].command, "wslview");
  assert.equal(wsl[1].command, "explorer.exe");
});
