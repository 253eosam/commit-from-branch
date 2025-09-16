// src/init.ts
import fs from "fs";
import path from "path";
var HUSKY_FILE = "prepare-commit-msg";
var HOOK_LINE = 'cfb "$1" "$2" "$3"';
var createHuskyState = (cwd) => {
  const huskyDir = path.join(cwd, ".husky");
  const hookPath = path.join(huskyDir, HUSKY_FILE);
  const huskyExists = fs.existsSync(huskyDir);
  const hookExists = fs.existsSync(hookPath);
  let currentContent;
  let hookPresent;
  if (hookExists) {
    currentContent = fs.readFileSync(hookPath, "utf8");
    hookPresent = currentContent.includes(HOOK_LINE);
  }
  return {
    huskyDir,
    hookPath,
    huskyExists,
    hookExists,
    currentContent,
    hookPresent
  };
};
var initStrategies = [
  (state) => !state.huskyExists ? {
    exitCode: 1,
    message: [
      "[cfb] Husky not found. This package requires Husky v9 as a peer dependency.",
      "",
      "  Install and initialize Husky v9:",
      "    npm install --save-dev husky@^9.0.0",
      "    npm exec husky init",
      "",
      "  Then run: cfb init"
    ].join("\n")
  } : null,
  (state) => !state.hookExists ? {
    exitCode: 0,
    message: "[cfb] \u2713 Created .husky/prepare-commit-msg and added cfb hook",
    action: () => {
      fs.writeFileSync(state.hookPath, HOOK_LINE, "utf8");
      fs.chmodSync(state.hookPath, 493);
    }
  } : null,
  (state) => state.hookPresent ? {
    exitCode: 0,
    message: "[cfb] \u2713 Hook already present"
  } : null,
  (state) => ({
    exitCode: 0,
    message: "[cfb] \u2713 Appended cfb hook to existing prepare-commit-msg",
    action: () => {
      const updated = state.currentContent.trimEnd() + `

${HOOK_LINE}
`;
      fs.writeFileSync(state.hookPath, updated, "utf8");
    }
  })
];
var applyInitStrategy = (state) => {
  for (const strategy of initStrategies) {
    const result = strategy(state);
    if (result) return result;
  }
  return { exitCode: 1, message: "[cfb] unexpected error" };
};
function initHusky(cwd = process.cwd()) {
  const state = createHuskyState(cwd);
  const result = applyInitStrategy(state);
  result.action?.();
  console.log(result.message);
  return result.exitCode;
}

export {
  initHusky
};
