# Master Plan: Secure, Full-Capability MCP-for-i

## Vision
Build `mcp-for-i` into a production-grade IBM i agent platform where:
1. Secrets are managed outside LLM prompts.
2. Sessions stay warm with sliding inactivity timeout (default 30 minutes).
3. Tooling reaches broad user-equivalent capability (DB2, CL/QSYS/IFS, deploy, diagnostics, 5250 roadmap).
4. Policy is guarded-by-default with explicit approval for risky operations.
5. UI-driven onboarding and updates manage MCP + skills lifecycle.

## Locked Decisions
1. UI is part of onboarding/control-plane.
2. Full 5250 automation is in scope (phased delivery).
3. Default policy profile is `guarded`.
4. Session idle timeout defaults to 30 minutes and extends on use.
5. No IBM i-side service install is required.
6. Cross-platform target; Windows-first acceptable if sequencing demands.
7. Collaboration workflows must stay IDE-independent (`RDi`, VS Code, or any editor) by using local-workspace artifacts and sync semantics rather than editor-specific integrations.
8. Source-management and promotion workflows must stay source-manager-agnostic and company-configurable, because dev/UAT/prod library movement, data copies, checkout rules, and promotion steps vary by shop.

## Phases

### Phase 0: Hardening + Build/Test Correctness
- Fix shell/SQL injection vectors and unsafe command interpolation.
- Add runtime tool-argument validation.
- Remove ESM/runtime defects.
- Make config writes queued/retry-safe and temp-file based.
- Split default tests (fast unit by default, full suite as explicit script).
- Improve repo hygiene defaults.

### Phase 1: Secure Onboarding UI + Local Control Plane
- UI for install, connection profile lifecycle, credential onboarding, update actions.
- Local control plane to mediate UI and MCP runtime.
- Secret isolation: no plaintext credential persistence; no credential-first chat flows.

### Phase 2: Session Lifecycle
- Multi-session tracking and keepalive.
- Sliding inactivity timeout + configurable TTL.
- Session tools: list/status/keepalive/terminate.

### Phase 3: Data/Execution Surface
- `ibmi.sql.query` (read-only + cursor pagination).
- `ibmi.sql.execute` (guarded write execution).
- `ibmi.cl.run` (guarded command execution).
- Diagnostics + ops primitives (`parseEvfevent`, `joblog`, spool read/list).

### Phase 4: Deploy + Diagnostics Parity
- Strengthen deploy compare/sync semantics.
- Add diagnostics normalization and robust action execution mapping.

### Phase 5: TN5250 Engine
- Connection, screen model, input primitives, waits/retries.
- Guardrails for risky interactive transactions.

### Phase 6: Audit, Journaling, and Compliance
- Add tamper-evident MCP action audit trails (who/what/when/approval/result/correlation IDs).
- Add IBM i journaling lifecycle tooling (receiver management, start/end journaling, normalized journal queries).
- Add compliance-friendly export/retention controls for audit evidence.

### Phase 7: IBM i Operations Control
- Job and subsystem lifecycle controls (list/hold/release/end/status).
- Message queue workflows (read/send/reply for inquiry and operational queues).
- Lock/contention and authority visibility before risky writes.
- Add key IBM i operational surfaces not yet covered: data queue/data area operations, and richer output queue controls.

### Phase 8: Reliability, Recovery, and Change Assurance
- Guarded backup/restore primitives with preflight/postflight verification.
- Journal receiver-chain health checks and retention/rotation safeguards.
- System health checks (ASP usage, job pressure, service availability) with automation-ready status payloads.
- Change safety checkpoints (verification and rollback-oriented workflows).

### Phase 9: Agent Skills + Safe Autonomy
- Task-to-skill routing and safe autonomy controls.
- Scoped learning/memory model with private and shared boundaries.
- Add collaborative source workflows so IBM i members can be materialized into a local workspace, edited by developer tools and Codex, diffed, and synced back safely.
- Preserve source metadata needed for RPG workflows (source type, dates where enabled, origin member path, and sync status).
- Support source-manager-aware flows (for example TD/OMS-style checkout/build/promote actions) without forcing every developer to abandon existing tooling.
- Keep the base workflow usable off the shelf without any source manager by supporting direct member/IFS collaboration plus optional company-specific workflow adapters.
- Prefer companion MCPs for opinionated source-management products (for example a dedicated TD/OMS MCP) so `mcp-for-i` remains a neutral IBM i access/collaboration layer while workflow-specific behavior lives behind a separate adapter boundary.

### Phase 10: Packaging + Updater Distribution
- Installer/updater across Windows/macOS/Linux.
- GitHub-backed MCP and skills update channels with rollback safety.

## Current Status
- Phase 0: complete (strict runtime schemas across tools, nested payload validation, QSYS/source-setting input hardening, safer deploy/debug interpolation paths, compile-time library-name validation, and green default test suite)
- Phase 1: complete (control-plane UI + secure profile onboarding + keychain secret isolation + secret-arg blocking + legacy plaintext credential migration + post-launch UX polish: auto-reconnect after install/update, runtime version badges, clearer status, row-level delete)
- Pre-Phase-2 release prep: complete (npm metadata migration to personal GitHub account, npm/global-safe update behavior with Windows self-update scheduling, npm-facing docs refresh)
- Release automation: complete (one-command auto-bump + publish + tag push workflow via npm scripts)
- Phase 2: complete (pooled async session manager, sliding inactivity timeout, heartbeat + transient reconnect strategy, session tooling, and control-plane UI observability/settings)
- Phase 3: complete (SQL query/execute/CL run finished with timeout controls, metadata, guarded policy gates, diagnostics/joblog/spool ops, and structured machine-safe tool envelopes)
- Phase 4: complete (deploy compare/sync parity with drift classification + dry-run/delete mapping, normalized diagnostics payloads, and robust `actions.run` execution mapping with parsed command diagnostics)
- Post-Phase-4 compatibility hardening (2026-03-12): complete (`ibmi.qsys.sourcefiles.list` no longer uses invalid OBJTYPELIST, `ibmi.spool.list` now falls back when `FILE_STATUS` is unavailable, and `ibmi.libl.{set,add,remove,setCurrent}` now advertise `approve` under guarded policy)
- Phase 5: complete (stateful TN5250 command session tools implemented: connect/read/set/send/wait/snapshot/disconnect, key handling, wait/retry loop, session snapshots, and guarded policy enforcement for interactive command execution)
- Phase 6: complete (tamper-evident tool audit chain with verify/export/purge controls, journaling lifecycle across PF and IFS, QAUDJRN compliance event querying, receiver-retention automation with policy gates, and compliance report/bundle generation with optional signing)
- Phase 7: complete (IBM i operations control expansion with spool hold/release/delete/move, job lifecycle controls, subsystem lifecycle/status tooling, message-queue send/read/reply workflows, lock + object-authority visibility, and data queue/data area operations)
- Phase 9 foundation: complete (added `ibmi-mcp-universal` agent-agnostic skill pack with portable playbooks, tool grouping, error recovery guidance, and safety/cleanup conventions for non-Codex and Codex agents)
- Collaborative source workflow planning (2026-03-25): identified the next gap as first-class local materialization/sync of IBM i source members so Codex can inspect/edit RPG sources while developers continue using their preferred IBM i/source-management workflow.
- Workflow-boundary decision shaping (2026-03-25): dedicated source-manager MCPs are preferred over baking TD/OMS behavior into `mcp-for-i`; `mcp-for-i` should stay generic and interoperate with optional workflow MCPs.
- Cross-platform runtime/security planning (2026-03-26): current config-path and keychain intent are already portable, but control-plane lifecycle and updater/autostart flows remain Windows-first. Next packaging/runtime work should introduce explicit platform adapters for autostart/update/install behavior, plus a credential-provider abstraction with ordered backends: native OS keychain first, then a local user-approved secret broker for headless/WSL cases, and only in-memory session fallback as a last resort.
- Cross-platform credential decision shaping (2026-03-26): WSL/headless Linux should not depend on plaintext config or prompt-supplied passwords. Preferred design is to keep durable secrets in the host/native OS trust store when available (Windows Credential Manager, macOS Keychain, Linux Secret Service/libsecret) and support a local broker/device-flow style handoff for environments without a usable desktop keychain.
- Cross-platform control-plane simplification (2026-03-26): completed first pass by removing control-plane install/repair and autostart management from the UI/API, keeping standard npm install/update flows as the default operator path, and introducing explicit platform/browser-launch helpers for Windows, macOS, Linux, and WSL.
- Cross-terminal command execution hardening (2026-03-26): completed first pass by preferring direct executable launches over shell-coupled behavior, only falling back to a shell for Windows `.cmd`/`.bat` shims, and improving npm CLI resolution so update flows behave more consistently across PowerShell, `cmd`, Git Bash, Bash/Zsh, and WSL.
- Control command convergence (2026-03-26): completed by routing `mcp-for-i control ...` and `mcp-for-i-control ...` through the same control-plane command layer so help text, open/start behavior, service management, and status reporting stay aligned.
- Background service enablement (2026-03-26): completed first pass with explicit `enable/disable/status` flows: Windows Startup entry, macOS LaunchAgent, Linux user `systemd` service when available, and guarded `.bashrc` hook fallback for WSL and non-systemd Linux shells.
- Phase 8-10: pending
