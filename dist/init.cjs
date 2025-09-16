"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/init.ts
var init_exports = {};
__export(init_exports, {
  initHusky: () => initHusky
});
module.exports = __toCommonJS(init_exports);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var HUSKY_FILE = "prepare-commit-msg";
var HOOK_LINE = 'cfb "$1" "$2" "$3"';
var createHuskyState = (cwd) => {
  const huskyDir = import_path.default.join(cwd, ".husky");
  const hookPath = import_path.default.join(huskyDir, HUSKY_FILE);
  const huskyExists = import_fs.default.existsSync(huskyDir);
  const hookExists = import_fs.default.existsSync(hookPath);
  let currentContent;
  let hookPresent;
  if (hookExists) {
    currentContent = import_fs.default.readFileSync(hookPath, "utf8");
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
      import_fs.default.writeFileSync(state.hookPath, HOOK_LINE, "utf8");
      import_fs.default.chmodSync(state.hookPath, 493);
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
      import_fs.default.writeFileSync(state.hookPath, updated, "utf8");
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initHusky
});
