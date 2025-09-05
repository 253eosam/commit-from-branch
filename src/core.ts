import fs from 'fs';
import cp from 'child_process';
import { loadConfig } from './config';
import { renderTemplate } from './tokens';
import type { RunOptions, Context } from './types';

const reStar = (pat: string) =>
  new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');
const includeMatch = (s: string, pats: string[]) => pats.some(p => reStar(p).test(s));

const isDebug = (env: NodeJS.ProcessEnv) => /^(1|true|yes)$/i.test(String(env.BRANCH_PREFIX_DEBUG || ''));
const isDryRun = (env: NodeJS.ProcessEnv) => /^(1|true|yes)$/i.test(String(env.BRANCH_PREFIX_DRYRUN || ''));

export function run(opts: RunOptions = {}) {
  const argv = opts.argv ?? process.argv;
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  const [, , COMMIT_MSG_PATH, SOURCE] = argv;

  const debug = isDebug(env);
  const log = (...a: any[]) => { if (debug) console.log('[cfb]', ...a); };

  if (!COMMIT_MSG_PATH) return 0;

  const cfg = loadConfig(cwd);
  log('config', cfg);

  if (SOURCE && cfg.exclude.some(x => new RegExp(x, 'i').test(String(SOURCE)))) {
    log('exit: excluded by source', SOURCE);
    return 0;
  }

  let branch = '';
  try {
    branch = cp.execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore','pipe','ignore'] }).toString().trim();
  } catch {}
  if (!branch || branch === 'HEAD') {
    log('exit: no branch or detached HEAD');
    return 0;
  }

  if (!includeMatch(branch, cfg.includePatterns)) {
    log('exit: includePattern mismatch', branch);
    return 0;
  }

  const ticket = (branch.match(/([A-Z]+-\d+)/i)?.[1] || '').toUpperCase();
  const body = fs.readFileSync(COMMIT_MSG_PATH, 'utf8');
  const lines = body.split('\n');
  const msg0 = lines[0] ?? '';
  const segs = branch.split('/');

  const tpl = ticket ? cfg.format : cfg.fallbackFormat;
  const ctx: Context = { branch, segs, ticket, msg: msg0, body };
  const hasMsgToken = /\$\{msg\}|\$\{body\}/.test(tpl);
  const rendered = renderTemplate(tpl, ctx);

  log('branch', branch, 'ticket', ticket || '(none)');
  log('tpl', tpl);
  log('rendered', rendered);
  log('mode', hasMsgToken ? 'replace-line' : 'prefix-only');

  if (hasMsgToken) {
    if (msg0 === rendered) return 0;
    lines[0] = rendered;
  } else {
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('^\\s*' + esc(rendered), 'i').test(msg0)) return 0;
    lines[0] = rendered + msg0;
  }

  if (isDryRun(env)) {
    log('dry-run: not writing');
    return 0;
  }

  fs.writeFileSync(COMMIT_MSG_PATH, lines.join('\n'), 'utf8');
  log('write ok');
  return 0;
}
