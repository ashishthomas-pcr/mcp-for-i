#!/usr/bin/env node
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getTools, handleTool } from "./mcp/tools.js";
import { McpContext } from "./mcp/context.js";
import { log } from "./mcp/logger.js";
import { validateToolInput } from "./mcp/validation.js";
import { appendAuditRecord } from "./mcp/audit.js";
import { runControlCommand } from "./controlplane/commands.js";
const argv = process.argv.slice(2);
const firstArg = (argv[0] || "").toLowerCase();
const packageVersion = readPackageVersion();
if (firstArg === "control") {
    await runControlCommand(argv.slice(1), {
        defaultCommand: "open",
        scriptPath: fileURLToPath(new URL("./controlplane/index.js", import.meta.url))
    });
    process.exit(0);
}
if (firstArg === "--version" || firstArg === "-v" || firstArg === "version") {
    process.stdout.write(`${packageVersion}\n`);
    process.exit(0);
}
if (firstArg === "--help" || firstArg === "-h" || firstArg === "help") {
    printHelp();
    process.exit(0);
}
const server = new Server({ name: "mcp-for-i", version: packageVersion }, { capabilities: { tools: {} } });
const ctx = new McpContext();
const tools = getTools();
const toolMap = new Map(tools.map(tool => [tool.name, tool]));
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const correlationId = crypto.randomUUID();
    const startedAt = Date.now();
    try {
        const toolDef = toolMap.get(name);
        if (!toolDef)
            throw new Error(`Unknown tool: ${name}`);
        const errors = validateToolInput(toolDef.inputSchema, args || {});
        if (errors.length > 0) {
            throw new Error(`Invalid arguments: ${errors.join("; ")}`);
        }
        const redactedArgs = redactSensitive(args || {});
        log("info", "tool.call", { name, correlationId, args: redactedArgs });
        const result = await handleTool(ctx, name, args || {});
        const durationMs = Date.now() - startedAt;
        log("debug", "tool.result", { name, correlationId, durationMs });
        await safeAppendAudit({
            tool: name,
            status: "ok",
            args: redactedArgs,
            connectionName: resolveConnectionName(name, args || {}, ctx.activeName),
            approve: Boolean(args && typeof args === "object" && args.approve),
            durationMs,
            correlationId,
            resultSummary: summarizeResult(result)
        });
        return result;
    }
    catch (err) {
        const durationMs = Date.now() - startedAt;
        const errorMessage = err?.message || String(err);
        log("error", "tool.error", { name, correlationId, durationMs, error: errorMessage });
        await safeAppendAudit({
            tool: name,
            status: "error",
            args: redactSensitive(args || {}),
            connectionName: resolveConnectionName(name, args || {}, ctx.activeName),
            approve: Boolean(args && typeof args === "object" && args.approve),
            durationMs,
            correlationId,
            error: errorMessage
        });
        return {
            isError: true,
            content: [{ type: "text", text: errorMessage }]
        };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
function redactSensitive(input) {
    const secrets = new Set(["password", "passphrase", "secret", "token", "apikey", "apiKey", "authorization"]);
    if (Array.isArray(input)) {
        return input.map(redactSensitive);
    }
    if (typeof input === "object" && input !== null) {
        const out = {};
        for (const [key, value] of Object.entries(input)) {
            if (secrets.has(key)) {
                out[key] = "***REDACTED***";
            }
            else {
                out[key] = redactSensitive(value);
            }
        }
        return out;
    }
    return input;
}
function summarizeResult(result) {
    const contentCount = Array.isArray(result?.content) ? result.content.length : 0;
    return {
        isError: Boolean(result?.isError),
        contentCount,
        hasStructuredContent: typeof result?.structuredContent !== "undefined"
    };
}
function resolveConnectionName(tool, args, activeName) {
    if (args?.connectionName)
        return String(args.connectionName);
    if (tool === "ibmi.connect" && args?.name)
        return String(args.name);
    return activeName;
}
async function safeAppendAudit(input) {
    if (process.env.MCP_FOR_I_AUDIT_ENABLED === "0")
        return;
    try {
        await appendAuditRecord(input);
    }
    catch (err) {
        log("warn", "audit.append.failed", { error: err?.message || String(err) });
    }
}
function printHelp() {
    process.stderr.write(`mcp-for-i usage:\n`);
    process.stderr.write(`  mcp-for-i                 Start MCP stdio server\n`);
    process.stderr.write(`  mcp-for-i control         Start/open control plane UI\n`);
    process.stderr.write(`  mcp-for-i control status  Show control plane and background-service status\n`);
    process.stderr.write(`  mcp-for-i control enable  Enable background service for this platform\n`);
    process.stderr.write(`  mcp-for-i control disable Disable background service for this platform\n`);
    process.stderr.write(`  mcp-for-i --version       Print package version\n`);
}
function readPackageVersion() {
    try {
        const packageJsonPath = fileURLToPath(new URL("../package.json", import.meta.url));
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        return typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
    }
    catch {
        return "0.0.0";
    }
}
