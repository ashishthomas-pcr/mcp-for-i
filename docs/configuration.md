# Configuration

Config file is stored under the user config directory:
- Windows: `%APPDATA%\mcp-for-i\config.json`
- macOS: `~/Library/Application Support/mcp-for-i/config.json`
- Linux: `${XDG_CONFIG_HOME:-~/.config}/mcp-for-i/config.json`

## Settings
Default settings (editable in the config file):
- `readOnlyMode`: boolean
- `tempLibrary`: string
- `tempDir`: string
- `autoClearTempData`: boolean
- `sourceFileCCSID`: string (default `*FILE`)
- `enableSourceDates`: boolean (Phase 2+)
- `homeDirectory`: string
- `libraryList`: string[]
- `currentLibrary`: string
- `customVariables`: list of `{ name, value }`

## Connections
Connections are stored without passwords. Passwords are stored in OS keychain (or in-session fallback). Each connection can include optional `settings` overrides.
The control plane health response and Overview page report whether password storage is persistent (`keychain`) or process-only (`session`).
WSL users should note that Linux Secret Service is separate from Windows Credential Manager; if WSL has no working keychain, passwords must be re-entered after the process exits.
Set `MCP_FOR_I_CREDENTIAL_STORE=session` to force process-only password storage even when a keychain is available.
Connections can also define policy, for example:
- `read-only`
- `guarded` (default; approvals required for risky operations)
- `power-user`

Example:
```json
{
  "connections": [
    {
      "name": "DEV400",
      "host": "dev400.myco.com",
      "port": 22,
      "username": "DEVUSER",
      "privateKeyPath": "C:/keys/id_rsa",
      "settings": {
        "readOnlyMode": false
      },
      "policy": {
        "profile": "guarded",
        "requireApprovalFor": ["sql.write", "cl.run", "deploy.sync"]
      },
      "profiles": [
        {
          "name": "projectA",
          "currentLibrary": "PROJALIB",
          "libraryList": ["QSYS", "QGPL", "PROJALIB"],
          "customVariables": [{ "name": "ENV", "value": "DEV" }]
        }
      ],
      "currentProfile": "projectA"
    }
  ]
}
```
