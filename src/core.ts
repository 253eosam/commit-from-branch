import fs from 'fs';
import cp from 'child_process';
import { loadConfig } from './config';
import { renderTemplate } from './tokens';
import type { RunOptions, ProcessingState, ValidationRule, MessageProcessor, Context } from './types';

// =============================================================================
// 유틸리티 함수들 (순수 함수)
// =============================================================================

const createRegexPattern = (pattern: string): RegExp =>
  new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');

const matchesAnyPattern = (value: string, patterns: string[]): boolean =>
  patterns.some(pattern => createRegexPattern(pattern).test(value));

const parseEnvironmentFlag = (env: NodeJS.ProcessEnv, key: string): boolean =>
  /^(1|true|yes)$/i.test(String(env[key] || ''));

const extractTicketFromBranch = (branch: string): string =>
  (branch.match(/([A-Z]+-\d+)/i)?.[1] || '').toUpperCase();

const getCurrentBranch = (): string => {
  try {
    return cp.execSync('git rev-parse --abbrev-ref HEAD', { 
      stdio: ['ignore', 'pipe', 'ignore'] 
    }).toString().trim();
  } catch {
    return '';
  }
};

const escapeRegexSpecialChars = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createLogger = (debug: boolean) => 
  (...args: any[]) => { if (debug) console.log('[cfb]', ...args); };

// =============================================================================
// 상태 초기화 함수
// =============================================================================

const createInitialState = (opts: RunOptions = {}): ProcessingState | null => {
  const argv = opts.argv ?? process.argv;
  const env = opts.env ?? process.env;
  const cwd = opts.cwd ?? process.cwd();
  const [, , commitMsgPath, source] = argv;

  if (!commitMsgPath) return null;

  const config = loadConfig(cwd);
  const branch = getCurrentBranch();
  const ticket = extractTicketFromBranch(branch);
  const debug = parseEnvironmentFlag(env, 'BRANCH_PREFIX_DEBUG');
  const isDryRun = parseEnvironmentFlag(env, 'BRANCH_PREFIX_DRYRUN');

  let originalMessage = '';
  let lines: string[] = [];
  try {
    const body = fs.readFileSync(commitMsgPath, 'utf8');
    lines = body.split('\n');
    originalMessage = lines[0] ?? '';
  } catch {
    // 파일을 읽을 수 없는 경우는 나중에 검증 단계에서 처리
  }

  const segs = branch.split('/');
  const template = ticket ? config.format : config.fallbackFormat;
  const context: Context = { branch, segs, ticket, msg: originalMessage, body: lines.join('\n') };
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

// =============================================================================
// 검증 규칙들 (선언적)
// =============================================================================

const validationRules: ValidationRule[] = [
  {
    name: 'source-exclusion',
    check: (state) => !state.source || !state.config.exclude.some(
      pattern => new RegExp(pattern, 'i').test(String(state.source))
    ),
    reason: 'excluded by source'
  },
  {
    name: 'branch-existence',
    check: (state) => Boolean(state.branch && state.branch !== 'HEAD'),
    reason: 'no branch or detached HEAD'
  },
  {
    name: 'include-pattern-match',
    check: (state) => matchesAnyPattern(state.branch, state.config.includePatterns),
    reason: 'includePattern mismatch'
  }
];

// =============================================================================
// 메시지 처리기들 (선언적)
// =============================================================================

const messageProcessors: MessageProcessor[] = [
  {
    name: 'template-replacement',
    shouldApply: (state) => /\$\{msg\}|\$\{body\}/.test(state.template),
    process: (state) => {
      if (state.originalMessage === state.renderedMessage) {
        return { ...state, shouldSkip: true, skipReason: 'message already matches template' };
      }
      return {
        ...state,
        lines: [state.renderedMessage, ...state.lines.slice(1)]
      };
    }
  },
  {
    name: 'prefix-addition',
    shouldApply: (state) => !/\$\{msg\}|\$\{body\}/.test(state.template),
    process: (state) => {
      const escaped = escapeRegexSpecialChars(state.renderedMessage);
      
      // 기존 프리픽스가 이미 있는지 확인
      if (new RegExp('^\\s*' + escaped, 'i').test(state.originalMessage)) {
        return { ...state, shouldSkip: true, skipReason: 'prefix already exists' };
      }
      
      // 티켓 번호가 이미 메시지에 있는지 확인
      if (state.ticket) {
        const ticketRegex = new RegExp(`\\b${escapeRegexSpecialChars(state.ticket)}\\b`, 'i');
        if (ticketRegex.test(state.originalMessage)) {
          return { ...state, shouldSkip: true, skipReason: 'ticket already in message' };
        }
      }
      
      // 브랜치 세그먼트가 이미 메시지에 있는지 확인
      const firstSeg = state.context.segs[0];
      if (firstSeg && firstSeg !== 'HEAD') {
        const segRegex = new RegExp(`\\b${escapeRegexSpecialChars(firstSeg)}\\b`, 'i');
        if (segRegex.test(state.originalMessage)) {
          return { ...state, shouldSkip: true, skipReason: 'branch segment already in message' };
        }
      }
      
      return {
        ...state,
        lines: [state.renderedMessage + state.originalMessage, ...state.lines.slice(1)]
      };
    }
  }
];

// =============================================================================
// 처리 파이프라인
// =============================================================================

const applyValidationRules = (state: ProcessingState): ProcessingState => {
  const log = createLogger(state.debug);
  log('config', state.config);
  
  for (const rule of validationRules) {
    if (!rule.check(state)) {
      const contextInfo = state.ticket || state.branch || 'unknown';
      log(`exit: ${rule.reason}`, `[${rule.name}]`, `context: ${contextInfo}`);
      return { ...state, shouldSkip: true, skipReason: rule.reason };
    }
  }
  return state;
};

const logProcessingInfo = (state: ProcessingState): ProcessingState => {
  const log = createLogger(state.debug);
  const hasMsgToken = /\$\{msg\}|\$\{body\}/.test(state.template);
  
  log('branch', `${state.branch}`, 'ticket', `${state.ticket || '(none)'}`, 'segs', `[${state.context.segs.join(', ')}]`);
  log('tpl', `"${state.template}"`);
  log('rendered', `"${state.renderedMessage}"`);
  log('mode', hasMsgToken ? 'replace-line' : 'prefix-only', `msg: "${state.originalMessage}"`);
  
  return state;
};

const processMessage = (state: ProcessingState): ProcessingState => {
  if (state.shouldSkip) return state;
  
  const applicableProcessor = messageProcessors.find(processor => 
    processor.shouldApply(state)
  );
  
  if (!applicableProcessor) {
    return { ...state, shouldSkip: true, skipReason: 'no applicable processor' };
  }
  
  return applicableProcessor.process(state);
};

const writeResult = (state: ProcessingState): ProcessingState => {
  const log = createLogger(state.debug);
  
  if (state.shouldSkip) {
    const contextInfo = state.ticket || state.context.segs[0] || 'unknown';
    log(`skip: ${state.skipReason}`, `[${contextInfo}]`);
    return state;
  }
  
  if (state.isDryRun) {
    log('dry-run: not writing', `[${state.context.branch}]`);
    return state;
  }
  
  try {
    fs.writeFileSync(state.commitMsgPath, state.lines.join('\n'), 'utf8');
    log('write ok', `[${state.context.branch}]`, `-> "${state.lines[0]}"`);
  } catch (error) {
    log('write error:', error, `[${state.context.branch}]`);
  }
  
  return state;
};

// =============================================================================
// 메인 함수 (함수형 파이프라인)
// =============================================================================

const pipe = <T>(...functions: Array<(arg: T) => T>) => (value: T): T =>
  functions.reduce((acc, fn) => fn(acc), value);

export function run(opts: RunOptions = {}): number {
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

// =============================================================================
// 외부에서 사용할 수 있는 유틸리티 함수들 (테스트용)
// =============================================================================

export {
  createInitialState,
  validationRules,
  messageProcessors,
  applyValidationRules,
  processMessage
};

// Export types for external use
export type {
  CommitFromBranchConfig,
  Context,
  RunOptions,
  ProcessingState,
  ValidationRule,
  MessageProcessor
} from './types';