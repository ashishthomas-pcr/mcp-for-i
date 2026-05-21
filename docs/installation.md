# Installation

## Prerequisites
- Node.js 18+ recommended
- IBM i SSH access (22)
- On Linux: `libsecret` (for keychain via `keytar`)
- Works from PowerShell, `cmd`, Git Bash, Bash, Zsh, and WSL shells

WSL note: password persistence depends on a working Linux Secret Service inside the WSL distro. WSL does not automatically share Windows Credential Manager with Linux `keytar`. If the control plane reports session-only credential storage, use SSH keys, configure libsecret/Secret Service in WSL, or run MCP-for-i from Windows.

Credential storage follows the Node runtime, not only the visible terminal: PowerShell, `cmd`, and Git Bash with Windows Node use Windows Credential Manager; WSL with Linux Node uses Linux Secret Service.

## Install
1. Clone or copy this repo for git-checkout usage, or install globally for npm usage
2. For git-checkout usage, install dependencies:
   - `npm install`
3. Build:
   - `npm run build`
4. Run MCP from source:
   - `node dist/index.js`

For npm/global usage:

```bash
npm i -g mcp-for-i
```

## Control Plane UI (Onboarding + Updates)
Preferred command from npm or a git checkout build:

- `mcp-for-i control`

Open:

- `http://127.0.0.1:3980`

`mcp-for-i control` starts the control plane in the background if needed, then opens the UI when possible. In headless environments it prints the URL instead.

Use the UI to add/edit/delete/rename connections, manage keychain passwords, manage background-service status, and run MCP/skills update actions.

The `Clients` tab can also add `mcp-for-i` directly to supported local coding clients:
- Codex Desktop / CLI
- Claude Code, when the `claude` command is installed
- VS Code / GitHub Copilot, when the `code` command is installed

For unsupported or not-installed clients such as Project Bob, the UI shows ready-to-copy manual instructions.

## MCP (stdio) usage
Configure your MCP client (e.g., Codex CLI) to run `mcp-for-i` via stdio. Example (pseudo-config):

```json
{
  "mcpServers": {
    "mcp-for-i": {
      "command": "mcp-for-i"
    }
  }
}
```

If you run from source, use:

```json
{
  "command": "node",
  "args": ["C:/Users/pgmashish/projects/mcp/mcp-for-i/dist/index.js"]
}
```

For npm-installed package updates outside the UI:

```bash
npm i -g mcp-for-i@latest
```

## Background Service Management

The control plane supports explicit background-service registration:

```bash
mcp-for-i control status
mcp-for-i control enable
mcp-for-i control disable
```

Platform behavior:
- Windows: Startup entry
- macOS: LaunchAgent
- Linux: user `systemd` service when available
- WSL: guarded `.bashrc` hook that starts the control plane on interactive Bash launch

## Logging (opt‑in)
Logging is **disabled by default**. Enable it via env vars or CLI flags:

- Env flags:
  - `MCP_FOR_I_LOG_ENABLED=1`
  - `MCP_FOR_I_LOG` = path to log file
  - `MCP_FOR_I_LOG_LEVEL` = `error|warn|info|debug` (default `info`)
  - `MCP_FOR_I_LOG_STDERR=1` to log to stderr (set `0` to disable)
- CLI flags (when running `node dist/index.js` directly):
  - `--log` (stderr, info level)
  - `--log-level=debug`
  - `--log-file=C:/path/to/log.txt`
