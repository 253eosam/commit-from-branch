// src/core.ts
import fs2 from "fs";
import cp from "child_process";

// src/config.ts
import fs from "fs";
import path from "path";
var DEFAULTS = {
  includePatterns: ["*"],
  format: "[${ticket}] ${msg}",
  fallbackFormat: "[${seg0}] ${msg}",
  exclude: ["merge", "squash", "revert"]
};
function loadConfig(cwd) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
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
  const argv = opts.argv ?? process.argv;
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  const [, , COMMIT_MSG_PATH, SOURCE] = argv;
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
    branch = cp.execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
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
  const body = fs2.readFileSync(COMMIT_MSG_PATH, "utf8");
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
  fs2.writeFileSync(COMMIT_MSG_PATH, lines.join("\n"), "utf8");
  log("write ok");
  return 0;
}

export {
  run
};
