#!/usr/bin/env node
import { fileURLToPath } from "url";
import { runControlCommand } from "./commands.js";

await runControlCommand(process.argv.slice(2), {
  defaultCommand: "serve",
  scriptPath: fileURLToPath(import.meta.url)
});
