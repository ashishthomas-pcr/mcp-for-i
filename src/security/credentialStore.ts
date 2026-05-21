import os from "os";

const SERVICE = "mcp-for-i";
const sessionStore = new Map<string, string>();
let lastKeychainError: string | undefined;

type CredentialStoreMode = "auto" | "keychain" | "session";

let keytar: any | undefined;
async function getKeytar() {
  if (keytar !== undefined) return keytar;
  try {
    const mod = await import("keytar");
    keytar = mod.default || mod;
  } catch {
    keytar = null;
  }
  return keytar;
}

export function detectCredentialEnvironment(env: NodeJS.ProcessEnv = process.env, platform = process.platform, release = os.release()) {
  const isWsl = isWslRuntime(env, platform, release);
  const shell = String(env.SHELL || env.ComSpec || env.PSModulePath || "").toLowerCase();
  const terminal = platform === "win32"
    ? shell.includes("bash") || shell.includes("git") || env.MSYSTEM
      ? "git-bash"
      : env.PSModulePath
        ? "powershell"
        : "cmd"
    : isWsl
      ? "wsl"
      : shell.includes("zsh")
        ? "zsh"
        : shell.includes("bash")
          ? "bash"
          : "unknown";
  const nativeStore = platform === "win32"
    ? "Windows Credential Manager"
    : platform === "darwin"
      ? "macOS Keychain"
      : "Linux Secret Service";

  return {
    platform,
    arch: process.arch,
    isWsl,
    terminal,
    nativeStore,
    label: isWsl
      ? "Linux (WSL)"
      : platform === "win32"
        ? "Windows"
        : platform === "darwin"
          ? "macOS"
          : platform === "linux"
            ? "Linux"
            : platform
  };
}

function getCredentialStoreMode(): CredentialStoreMode {
  const value = String(process.env.MCP_FOR_I_CREDENTIAL_STORE || "auto").trim().toLowerCase();
  if (value === "keychain" || value === "session") return value;
  return "auto";
}

function describeError(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

export async function setPassword(connectionName: string, password: string) {
  if (getCredentialStoreMode() === "session") {
    sessionStore.set(connectionName, password);
    return;
  }
  const kt = await getKeytar();
  if (kt) {
    try {
      await kt.setPassword(SERVICE, connectionName, password);
      lastKeychainError = undefined;
      sessionStore.delete(connectionName);
      return;
    } catch (err) {
      lastKeychainError = describeError(err);
    }
  }
  sessionStore.set(connectionName, password);
}

export async function getPassword(connectionName: string) {
  if (getCredentialStoreMode() === "session") {
    return sessionStore.get(connectionName);
  }
  const kt = await getKeytar();
  if (kt) {
    try {
      const password = await kt.getPassword(SERVICE, connectionName);
      lastKeychainError = undefined;
      if (password) return password;
    } catch (err) {
      lastKeychainError = describeError(err);
    }
  }
  return sessionStore.get(connectionName);
}

export async function deletePassword(connectionName: string) {
  if (getCredentialStoreMode() === "session") {
    sessionStore.delete(connectionName);
    return;
  }
  const kt = await getKeytar();
  if (kt) {
    try {
      await kt.deletePassword(SERVICE, connectionName);
      lastKeychainError = undefined;
    } catch (err) {
      lastKeychainError = describeError(err);
    }
  }
  sessionStore.delete(connectionName);
}

export async function isKeychainAvailable() {
  if (getCredentialStoreMode() === "session") return false;
  const kt = await getKeytar();
  if (!kt) return false;
  try {
    if (typeof kt.findCredentials === "function") {
      await kt.findCredentials(SERVICE);
    }
    lastKeychainError = undefined;
    return true;
  } catch (err) {
    lastKeychainError = describeError(err);
    return false;
  }
}

export async function getCredentialStoreStatus() {
  const requestedMode = getCredentialStoreMode();
  const environment = detectCredentialEnvironment();
  const keychainAvailable = await isKeychainAvailable();
  const isWsl = environment.isWsl;
  const mode = keychainAvailable ? "keychain" : "session";
  return {
    mode,
    requestedMode,
    persistent: keychainAvailable,
    keychainAvailable,
    platform: environment.platform,
    terminal: environment.terminal,
    nativeStore: environment.nativeStore,
    runtimeLabel: environment.label,
    isWsl,
    error: lastKeychainError,
    message: keychainAvailable
      ? `Passwords are stored in ${environment.nativeStore}.`
      : requestedMode === "session"
        ? "Password storage is configured for session-only mode by MCP_FOR_I_CREDENTIAL_STORE=session."
      : isWsl
        ? "WSL could not access a persistent Linux Secret Service keychain; passwords are kept in this process only. Use SSH keys, install/configure libsecret in WSL, or run MCP-for-i from Windows to use Windows Credential Manager."
        : "No persistent OS keychain is available; passwords are kept in this process only."
  };
}

function isWslRuntime(env: NodeJS.ProcessEnv = process.env, platform = process.platform, release = os.release()) {
  if (platform !== "linux") return false;
  if (env.WSL_DISTRO_NAME || env.WSL_INTEROP) return true;
  return /microsoft/i.test(release);
}
