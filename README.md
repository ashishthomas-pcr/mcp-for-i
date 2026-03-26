# MCP-for-i

`mcp-for-i` is a local MCP server + control plane for IBM i workflows. It provides secure connection onboarding, keychain-backed credentials, cross-platform runtime update controls, and IBM i tools for agent-driven operations.

## Install

Install globally from npm:

```bash
npm i -g mcp-for-i
```

Verify commands:

```bash
mcp-for-i --help
mcp-for-i-control help
```

Supported shells and terminals include PowerShell, `cmd`, Git Bash, Bash, Zsh, and WSL shells, across Windows, macOS, and Linux.

## Quick Start

1. Start the local control plane:

```bash
mcp-for-i-control serve
```

2. Open the UI at:

```text
http://127.0.0.1:3980
```

3. Add IBM i connection profiles in the UI. Passwords are stored in the OS keychain, not plain config.

## Update and Version Management

Update to latest globally:

```bash
npm i -g mcp-for-i@latest
```

Install a specific version:

```bash
npm i -g mcp-for-i@0.1.1
```

Rollback example:

```bash
npm i -g mcp-for-i@0.1.0
```

Check current installed version:

```bash
mcp-for-i --version
```

## Control Plane Updates

The control plane intentionally stays narrow:

- `Update MCP`
  - If running from a git checkout: pulls latest changes from `origin/<current-branch>`, then installs/builds.
  - If running as an npm-installed package: upgrades the global npm package to latest.
  - On Windows global installs, update still runs in a detached updater to avoid file-lock (`EBUSY`) errors during self-update.
- `Update Skills`
  - Pulls or clones the configured skills repository and branch into the local `skills` directory.

Install and background-startup management are no longer first-class UI actions. For package installs and manual upgrades, prefer standard npm commands such as `npm i -g mcp-for-i@latest`.

## Development (Git Checkout)

For contributors working from source:

```bash
npm install
npm run build
npm test
npm run start:controlplane
```

## Automated Release (No Manual Version Bump)

Use the release script instead of raw `npm publish`.

Patch release:

```bash
npm run release:patch
```

Minor release:

```bash
npm run release:minor
```

Major release:

```bash
npm run release:major
```

What it does:
- Verifies git working tree is clean.
- Runs `npm test` (unless `--skip-tests` is passed).
- Checks npm published version.
- Auto-bumps version only when local version is not ahead.
- Publishes to npm.
- Pushes commit/tag to GitHub.

Optional flags:

```bash
npm run release:patch -- --skip-tests
npm run release:patch -- --otp=123456
npm run release:patch -- --no-push
```

## Security Model

- Credential-bearing direct tool arguments are blocked for connection creation/update flows.
- Passwords are stored in keychain when available.
- Control plane is local-first (`127.0.0.1` by default).
- Guarded policy profile is the default for operational safety.
- Tool schemas are strict (`additionalProperties: false`) with runtime argument validation, including nested connection/action/filter/profile payloads.
- QSYS object names and source settings are validated before command execution to reduce interpolation and injection risk.

## Links

- Main repo: [ashishthomas2202/mcp-for-i](https://github.com/ashishthomas2202/mcp-for-i)
- Skills repo: [ashishthomas2202/mcp-for-i-skills](https://github.com/ashishthomas2202/mcp-for-i-skills)
- Docs: `docs/`
- Full capability guide: `docs/capabilities.md`
