# Security

- Credentials are stored in OS keychain via `keytar` (Windows Credential Manager, macOS Keychain, Linux libsecret).
- Credential storage is selected at runtime from the Node process environment:
  - Windows Node from PowerShell, `cmd`, or Git Bash uses Windows Credential Manager.
  - macOS Node uses macOS Keychain.
  - Linux Node uses Linux Secret Service.
  - WSL Node is Linux and uses the WSL distro's Linux Secret Service, not Windows Credential Manager.
- Keychain availability is checked as an actual read operation, not only as a module import.
- If keychain is unavailable or a keychain operation fails, credentials are stored in memory for the current process only.
- In WSL, `keytar` uses the Linux Secret Service inside the distro. It does not automatically use Windows Credential Manager. For persistent credentials in WSL, configure Linux libsecret/Secret Service, use SSH keys, or run MCP-for-i from Windows.
- Set `MCP_FOR_I_CREDENTIAL_STORE=session` to force process-only password storage.
- Passwords are never written to the config file.
- `readOnlyMode` prevents write operations on members/IFS.
- Connection policies support `read-only`, `guarded`, and `power-user` modes.
- Guarded mode requires `approve: true` for configured risky operations.
