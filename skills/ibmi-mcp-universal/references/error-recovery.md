# Error Recovery

## Guarded Policy Blocks
Error pattern:
- `Operation '...write...' requires approve=true under 'guarded' policy.`

Action:
1. Re-run with `approve: true`.
2. If still blocked, inspect connection policy/profile.

## Source File Listing Error
Error pattern:
- `OBJTYPELIST ARGUMENT NOT VALID (42616)`

Action:
1. Use updated server build that includes fallback logic.
2. Validate with `ibmi.qsys.objects.list` on `*FILE`/`*ALL`.
3. Restart stale MCP processes if old behavior persists.

## Spool Listing Error
Error pattern:
- `Column or global variable FILE_STATUS not found. (42703)`

Action:
1. Use updated server build with alternate spool queries.
2. Retry `ibmi.spool.list`.
3. Restart MCP runtime if error indicates stale binary.

## Authority/Permission Errors
Common patterns:
- CPF98xx/CPF22xx/authorization denied

Action:
1. Confirm object/library/path authority.
2. Switch to owned temp scope (`QTEMP`/personal library).
3. Re-test with minimal command.

## Transport/Session Failures
Error patterns:
- `Transport closed`
- Session disconnected/timeouts

Action:
1. Reconnect (`ibmi.connect`).
2. Confirm status (`ibmi.session.status`).
3. Retry operation once, then inspect process health.

## SQL Service Variability
Error patterns:
- Missing/unsupported QSYS2 columns/functions

Action:
1. Prefer tool fallbacks over manual SQL rewrites.
2. If tool still fails, collect exact SQL error and host release/PTF context.
3. Apply host-compatible query branch in implementation.
