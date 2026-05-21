import test from "node:test";
import assert from "node:assert/strict";
import { detectCredentialEnvironment } from "../dist/security/credentialStore.js";

test("credential environment maps Windows PowerShell to Windows Credential Manager", () => {
  const env = { PSModulePath: "C:\\Users\\dev\\Documents\\PowerShell\\Modules" };
  const detected = detectCredentialEnvironment(env, "win32", "10.0.22631");

  assert.equal(detected.label, "Windows");
  assert.equal(detected.terminal, "powershell");
  assert.equal(detected.nativeStore, "Windows Credential Manager");
  assert.equal(detected.isWsl, false);
});

test("credential environment treats Git Bash as Windows runtime storage", () => {
  const env = { SHELL: "C:/Program Files/Git/usr/bin/bash.exe", MSYSTEM: "MINGW64" };
  const detected = detectCredentialEnvironment(env, "win32", "10.0.22631");

  assert.equal(detected.label, "Windows");
  assert.equal(detected.terminal, "git-bash");
  assert.equal(detected.nativeStore, "Windows Credential Manager");
});

test("credential environment maps WSL to Linux Secret Service", () => {
  const env = { WSL_DISTRO_NAME: "Ubuntu", SHELL: "/bin/bash" };
  const detected = detectCredentialEnvironment(env, "linux", "6.6.87.2-microsoft-standard-WSL2");

  assert.equal(detected.label, "Linux (WSL)");
  assert.equal(detected.terminal, "wsl");
  assert.equal(detected.nativeStore, "Linux Secret Service");
  assert.equal(detected.isWsl, true);
});

test("credential environment maps macOS to macOS Keychain", () => {
  const detected = detectCredentialEnvironment({ SHELL: "/bin/zsh" }, "darwin", "23.4.0");

  assert.equal(detected.label, "macOS");
  assert.equal(detected.terminal, "zsh");
  assert.equal(detected.nativeStore, "macOS Keychain");
});
