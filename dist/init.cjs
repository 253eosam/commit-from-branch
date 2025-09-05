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
function initHusky(cwd = process.cwd()) {
  const huskyDir = import_path.default.join(cwd, ".husky");
  const hookPath = import_path.default.join(huskyDir, HUSKY_FILE);
  if (!import_fs.default.existsSync(huskyDir)) {
    console.log("[cfb] .husky not found. Run `npx husky init` first.");
    return 0;
  }
  if (!import_fs.default.existsSync(hookPath)) {
    const header = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

${HOOK_LINE}
`;
    import_fs.default.writeFileSync(hookPath, header, "utf8");
    import_fs.default.chmodSync(hookPath, 493);
    console.log("[cfb] created .husky/prepare-commit-msg and added cfb hook");
    return 0;
  }
  const current = import_fs.default.readFileSync(hookPath, "utf8");
  if (current.includes(HOOK_LINE)) {
    console.log("[cfb] hook already present");
    return 0;
  }
  const updated = current.trimEnd() + `

${HOOK_LINE}
`;
  import_fs.default.writeFileSync(hookPath, updated, "utf8");
  console.log("[cfb] appended cfb hook to existing prepare-commit-msg");
  return 0;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initHusky
});
