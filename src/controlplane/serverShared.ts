export function getControlPlaneUrl() {
  const host = process.env.MCP_FOR_I_CONTROL_HOST || "127.0.0.1";
  const portRaw = Number(process.env.MCP_FOR_I_CONTROL_PORT || 3980);
  const port = Number.isFinite(portRaw) && portRaw > 0 && portRaw <= 65535 ? Math.floor(portRaw) : 3980;
  return `http://${host}:${port}`;
}

export async function isControlPlaneRunning(baseUrl = getControlPlaneUrl()) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${baseUrl}/api/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
