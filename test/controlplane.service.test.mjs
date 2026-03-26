import test from "node:test";
import assert from "node:assert/strict";
import { removeManagedBlock, upsertManagedBlock } from "../dist/controlplane/serviceManager.js";

test("upsertManagedBlock appends a single managed shell block", () => {
  const original = "# existing\nexport PATH=\"$HOME/bin:$PATH\"\n";
  const block = "# >>> mcp-for-i control >>>\necho start\n# <<< mcp-for-i control <<<";

  const updated = upsertManagedBlock(original, block);
  const updatedAgain = upsertManagedBlock(updated, block);

  assert.equal((updatedAgain.match(/mcp-for-i control/g) || []).length, 2);
  assert.equal(updated, updatedAgain);
});

test("removeManagedBlock removes the managed shell block cleanly", () => {
  const content = [
    "# bashrc",
    "",
    "# >>> mcp-for-i control >>>",
    "echo start",
    "# <<< mcp-for-i control <<<",
    "",
    "export PATH=\"$HOME/bin:$PATH\""
  ].join("\n");

  const stripped = removeManagedBlock(content);
  assert.equal(stripped.includes("mcp-for-i control"), false);
  assert.equal(stripped.includes("export PATH"), true);
});
