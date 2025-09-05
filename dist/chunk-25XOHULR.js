// src/init.ts
import fs from "fs";
import path from "path";
var HUSKY_FILE = "prepare-commit-msg";
var HOOK_LINE = 'cfb "$1" "$2" "$3"';
function initHusky(cwd = process.cwd()) {
  const huskyDir = path.join(cwd, ".husky");
  const hookPath = path.join(huskyDir, HUSKY_FILE);
  if (!fs.existsSync(huskyDir)) {
    console.log("[cfb] .husky not found. Run `npx husky init` first.");
    return 0;
  }
  if (!fs.existsSync(hookPath)) {
    const header = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

${HOOK_LINE}
`;
    fs.writeFileSync(hookPath, header, "utf8");
    fs.chmodSync(hookPath, 493);
    console.log("[cfb] created .husky/prepare-commit-msg and added cfb hook");
    return 0;
  }
  const current = fs.readFileSync(hookPath, "utf8");
  if (current.includes(HOOK_LINE)) {
    console.log("[cfb] hook already present");
    return 0;
  }
  const updated = current.trimEnd() + `

${HOOK_LINE}
`;
  fs.writeFileSync(hookPath, updated, "utf8");
  console.log("[cfb] appended cfb hook to existing prepare-commit-msg");
  return 0;
}

export {
  initHusky
};
