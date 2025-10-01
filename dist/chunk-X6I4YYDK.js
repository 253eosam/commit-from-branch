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
var createRegexPattern = (pattern) => new RegExp("^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$", "i");
var matchesAnyPattern = (value, patterns) => patterns.some((pattern) => createRegexPattern(pattern).test(value));
var parseEnvironmentFlag = (env, key) => /^(1|true|yes)$/i.test(String(env[key] || ""));
var extractTicketFromBranch = (branch) => (branch.match(/([A-Z]+-\d+)/i)?.[1] || "").toUpperCase();
var getCurrentBranch = () => {
  try {
    return cp.execSync("git rev-parse --abbrev-ref HEAD", {
      stdio: ["ignore", "pipe", "ignore"]
    }).toString().trim();
  } catch {
    return "";
  }
};
var escapeRegexSpecialChars = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var createLogger = (debug) => (...args) => {
  if (debug) console.log("[cfb]", ...args);
};
var createInitialState = (opts = {}) => {
  const argv = opts.argv ?? process.argv;
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  const [, , commitMsgPath, source] = argv;
  if (!commitMsgPath) return null;
  const config = loadConfig(cwd);
  const branch = getCurrentBranch();
  const ticket = extractTicketFromBranch(branch);
  const debug = parseEnvironmentFlag(env, "BRANCH_PREFIX_DEBUG");
  const isDryRun = parseEnvironmentFlag(env, "BRANCH_PREFIX_DRYRUN");
  let originalMessage = "";
  let lines = [];
  try {
    const body = fs2.readFileSync(commitMsgPath, "utf8");
    lines = body.split("\n");
    originalMessage = lines[0] ?? "";
  } catch {
  }
  const segs = branch.split("/");
  const template = ticket ? config.format : config.fallbackFormat;
  const context = { branch, segs, ticket, msg: originalMessage, body: lines.join("\n") };
  const renderedMessage = renderTemplate(template, context);
  return {
    commitMsgPath,
    source,
    config,
    branch,
    ticket,
    originalMessage,
    lines,
    context,
    template,
    renderedMessage,
    shouldSkip: false,
    isDryRun,
    debug
  };
};
var validationRules = [
  {
    name: "source-exclusion",
    check: (state) => !state.source || !state.config.exclude.some(
      (pattern) => new RegExp(pattern, "i").test(String(state.source))
    ),
    reason: "excluded by source"
  },
  {
    name: "branch-existence",
    check: (state) => Boolean(state.branch && state.branch !== "HEAD"),
    reason: "no branch or detached HEAD"
  },
  {
    name: "include-pattern-match",
    check: (state) => matchesAnyPattern(state.branch, state.config.includePatterns),
    reason: "includePattern mismatch"
  }
];
var messageProcessors = [
  {
    name: "template-replacement",
    shouldApply: (state) => /\$\{msg\}|\$\{body\}/.test(state.template),
    process: (state) => {
      if (state.originalMessage === state.renderedMessage) {
        return { ...state, shouldSkip: true, skipReason: "message already matches template" };
      }
      return {
        ...state,
        lines: [state.renderedMessage, ...state.lines.slice(1)]
      };
    }
  },
  {
    name: "prefix-addition",
    shouldApply: (state) => !/\$\{msg\}|\$\{body\}/.test(state.template),
    process: (state) => {
      const escaped = escapeRegexSpecialChars(state.renderedMessage);
      if (new RegExp("^\\s*" + escaped, "i").test(state.originalMessage)) {
        return { ...state, shouldSkip: true, skipReason: "prefix already exists" };
      }
      if (state.ticket) {
        const ticketRegex = new RegExp(`\\b${escapeRegexSpecialChars(state.ticket)}\\b`, "i");
        if (ticketRegex.test(state.originalMessage)) {
          return { ...state, shouldSkip: true, skipReason: "ticket already in message" };
        }
      }
      const firstSeg = state.context.segs[0];
      if (firstSeg && firstSeg !== "HEAD") {
        const segRegex = new RegExp(`\\b${escapeRegexSpecialChars(firstSeg)}\\b`, "i");
        if (segRegex.test(state.originalMessage)) {
          return { ...state, shouldSkip: true, skipReason: "branch segment already in message" };
        }
      }
      return {
        ...state,
        lines: [state.renderedMessage + state.originalMessage, ...state.lines.slice(1)]
      };
    }
  }
];
var applyValidationRules = (state) => {
  const log = createLogger(state.debug);
  log("config", state.config);
  for (const rule of validationRules) {
    if (!rule.check(state)) {
      const contextInfo = state.ticket || state.branch || "unknown";
      log(`exit: ${rule.reason}`, `[${rule.name}]`, `context: ${contextInfo}`);
      return { ...state, shouldSkip: true, skipReason: rule.reason };
    }
  }
  return state;
};
var logProcessingInfo = (state) => {
  const log = createLogger(state.debug);
  const hasMsgToken = /\$\{msg\}|\$\{body\}/.test(state.template);
  log("branch", `${state.branch}`, "ticket", `${state.ticket || "(none)"}`, "segs", `[${state.context.segs.join(", ")}]`);
  log("tpl", `"${state.template}"`);
  log("rendered", `"${state.renderedMessage}"`);
  log("mode", hasMsgToken ? "replace-line" : "prefix-only", `msg: "${state.originalMessage}"`);
  return state;
};
var processMessage = (state) => {
  if (state.shouldSkip) return state;
  const applicableProcessor = messageProcessors.find(
    (processor) => processor.shouldApply(state)
  );
  if (!applicableProcessor) {
    return { ...state, shouldSkip: true, skipReason: "no applicable processor" };
  }
  return applicableProcessor.process(state);
};
var writeResult = (state) => {
  const log = createLogger(state.debug);
  if (state.shouldSkip) {
    const contextInfo = state.ticket || state.context.segs[0] || "unknown";
    log(`skip: ${state.skipReason}`, `[${contextInfo}]`);
    return state;
  }
  if (state.isDryRun) {
    log("dry-run: not writing", `[${state.context.branch}]`);
    return state;
  }
  try {
    fs2.writeFileSync(state.commitMsgPath, state.lines.join("\n"), "utf8");
    log("write ok", `[${state.context.branch}]`, `-> "${state.lines[0]}"`);
  } catch (error) {
    log("write error:", error, `[${state.context.branch}]`);
  }
  return state;
};
var pipe = (...functions) => (value) => functions.reduce((acc, fn) => fn(acc), value);
function run(opts = {}) {
  const initialState = createInitialState(opts);
  if (!initialState) return 0;
  const pipeline = pipe(
    applyValidationRules,
    logProcessingInfo,
    processMessage,
    writeResult
  );
  pipeline(initialState);
  return 0;
}

export {
  renderTemplate,
  createInitialState,
  validationRules,
  messageProcessors,
  applyValidationRules,
  processMessage,
  run
};
