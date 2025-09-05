#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/core.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_child_process = __toESM(require("child_process"), 1);

// src/config.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DEFAULTS = {
  includePatterns: ["*"],
  format: "[${ticket}] ${msg}",
  fallbackFormat: "[${seg0}] ${msg}",
  exclude: ["merge", "squash", "revert"]
};
function loadConfig(cwd) {
  try {
    const pkg = JSON.parse(import_fs.default.readFileSync(import_path.default.join(cwd, "package.json"), "utf-8"));
    const pkgCfg = pkg.commitFromBranch;
    const cfg = pkgCfg ?? {};
    const include = cfg.includePattern ?? "*";
    return {
      includePatterns: Array.isArray(include) ? include : [include],
      format: cfg.format ?? DEFAULTS.format,
      fallbackFormat: cfg.fallbackFormat ?? DEFAULTS.fallbackFormat,
      exclude: (cfg.exclude ?? DEFAULTS.exclude).map(String)
    };
  } catch {
    return { ...DEFAULTS };
  }
}

// src/tokens.ts
function renderTemplate(tpl, ctx) {
  let out = String(tpl);
  out = out.replace(/\$\{prefix:(\d+)\}/g, (_m, n) => {
    const k = Math.max(0, parseInt(n, 10) || 0);
    return ctx.segs.slice(0, k).join("/") || "";
  });
  out = out.replace(/\$\{seg(\d+)\}/g, (_m, i) => {
    const idx = parseInt(i, 10) || 0;
    return ctx.segs[idx] || "";
  });
  return out.replace(/\$\{ticket\}/g, ctx.ticket || "").replace(/\$\{branch\}/g, ctx.branch || "").replace(/\$\{segments\}/g, ctx.segs.join("/")).replace(/\$\{msg\}/g, ctx.msg || "").replace(/\$\{body\}/g, ctx.body || "");
}

// src/core.ts
var reStar = (pat) => new RegExp("^" + pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$", "i");
var includeMatch = (s, pats) => pats.some((p) => reStar(p).test(s));
var isDebug = (env) => /^(1|true|yes)$/i.test(String(env.BRANCH_PREFIX_DEBUG || ""));
var isDryRun = (env) => /^(1|true|yes)$/i.test(String(env.BRANCH_PREFIX_DRYRUN || ""));
function run(opts = {}) {
  const argv2 = opts.argv ?? process.argv;
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  const [, , COMMIT_MSG_PATH, SOURCE] = argv2;
  const debug = isDebug(env);
  const log = (...a) => {
    if (debug) console.log("[cfb]", ...a);
  };
  if (!COMMIT_MSG_PATH) return 0;
  const cfg = loadConfig(cwd);
  log("config", cfg);
  if (SOURCE && cfg.exclude.some((x) => new RegExp(x, "i").test(String(SOURCE)))) {
    log("exit: excluded by source", SOURCE);
    return 0;
  }
  let branch = "";
  try {
    branch = import_child_process.default.execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
  }
  if (!branch || branch === "HEAD") {
    log("exit: no branch or detached HEAD");
    return 0;
  }
  if (!includeMatch(branch, cfg.includePatterns)) {
    log("exit: includePattern mismatch", branch);
    return 0;
  }
  const ticket = (branch.match(/([A-Z]+-\d+)/i)?.[1] || "").toUpperCase();
  const body = import_fs2.default.readFileSync(COMMIT_MSG_PATH, "utf8");
  const lines = body.split("\n");
  const msg0 = lines[0] ?? "";
  const segs = branch.split("/");
  const tpl = ticket ? cfg.format : cfg.fallbackFormat;
  const ctx = { branch, segs, ticket, msg: msg0, body };
  const hasMsgToken = /\$\{msg\}|\$\{body\}/.test(tpl);
  const rendered = renderTemplate(tpl, ctx);
  log("branch", branch, "ticket", ticket || "(none)");
  log("tpl", tpl);
  log("rendered", rendered);
  log("mode", hasMsgToken ? "replace-line" : "prefix-only");
  if (hasMsgToken) {
    if (msg0 === rendered) return 0;
    lines[0] = rendered;
  } else {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp("^\\s*" + esc(rendered), "i").test(msg0)) return 0;
    lines[0] = rendered + msg0;
  }
  if (isDryRun(env)) {
    log("dry-run: not writing");
    return 0;
  }
  import_fs2.default.writeFileSync(COMMIT_MSG_PATH, lines.join("\n"), "utf8");
  log("write ok");
  return 0;
}

// src/init.ts
var import_fs3 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var HUSKY_FILE = "prepare-commit-msg";
var HOOK_LINE = 'cfb "$1" "$2" "$3"';
function initHusky(cwd = process.cwd()) {
  const huskyDir = import_path2.default.join(cwd, ".husky");
  const hookPath = import_path2.default.join(huskyDir, HUSKY_FILE);
  if (!import_fs3.default.existsSync(huskyDir)) {
    console.log("[cfb] .husky not found. Run `npx husky init` first.");
    return 0;
  }
  if (!import_fs3.default.existsSync(hookPath)) {
    const commandLine = HOOK_LINE;
    import_fs3.default.writeFileSync(hookPath, commandLine, "utf8");
    import_fs3.default.chmodSync(hookPath, 493);
    console.log("[cfb] created .husky/prepare-commit-msg and added cfb hook");
    return 0;
  }
  const current = import_fs3.default.readFileSync(hookPath, "utf8");
  if (current.includes(HOOK_LINE)) {
    console.log("[cfb] hook already present");
    return 0;
  }
  const updated = current.trimEnd() + `

${HOOK_LINE}
`;
  import_fs3.default.writeFileSync(hookPath, updated, "utf8");
  console.log("[cfb] appended cfb hook to existing prepare-commit-msg");
  return 0;
}

// src/cli.ts
var argv = process.argv.slice(2);
var cmd = argv[0];
if (cmd === "init") {
  process.exit(initHusky(process.cwd()) || 0);
} else {
  const passthroughArgv = [process.argv[0], process.argv[1], ...argv];
  process.exit(run({ argv: passthroughArgv }) || 0);
}
