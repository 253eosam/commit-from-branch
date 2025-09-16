// Browser-compatible wrapper for commit-from-branch core logic
import type { ProcessingState, CommitFromBranchConfig as OriginalConfig } from '@253eosam/commit-from-branch';

// Re-export types for compatibility
export type CommitFromBranchConfig = OriginalConfig;

export type Context = {
  branch: string;
  segs: string[];
  ticket: string;
  msg: string;
  body: string;
};

export type ProcessedConfig = CommitFromBranchConfig & {
  includePatterns: string[];
  format: string;
  fallbackFormat: string;
  exclude: string[];
};

export type PreviewState = ProcessingState;

// =============================================================================
// Browser-specific adaptations
// =============================================================================

const createRegexPattern = (pattern: string): RegExp =>
  new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');

const matchesAnyPattern = (value: string, patterns: string[]): boolean =>
  patterns.some(pattern => createRegexPattern(pattern).test(value));

const extractTicketFromBranch = (branch: string): string =>
  (branch.match(/([A-Z]+-\d+)/i)?.[1] || '').toUpperCase();

const escapeRegexSpecialChars = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Simple template renderer (extracted from main module logic)
export const renderTemplate = (tpl: string, ctx: Context): string => {
  let out = String(tpl);

  // ${prefix:n} → first n segments joined with '/'
  out = out.replace(/\$\{prefix:(\d+)\}/g, (_m, n) => {
    const k = Math.max(0, parseInt(n, 10) || 0);
    return ctx.segs.slice(0, k).join('/') || '';
  });

  // ${seg0}, ${seg1}, ...
  out = out.replace(/\$\{seg(\d+)\}/g, (_m, i) => {
    const idx = parseInt(i, 10) || 0;
    return ctx.segs[idx] || '';
  });

  return out
    .replace(/\$\{ticket\}/g, ctx.ticket || '')
    .replace(/\$\{branch\}/g, ctx.branch || '')
    .replace(/\$\{segments\}/g, ctx.segs.join('/'))
    .replace(/\$\{msg\}/g, ctx.msg || '')
    .replace(/\$\{body\}/g, ctx.body || '');
};

// =============================================================================
// Preview State Creation (browser-adapted)
// =============================================================================

export const createPreviewState = (
  config: CommitFromBranchConfig,
  branch: string,
  originalMessage: string = ''
): ProcessingState => {
  const ticket = extractTicketFromBranch(branch);
  const segs = branch.split('/');
  const lines = originalMessage.split('\n');

  const template = ticket ? config.format || '[${ticket}] ${msg}' : config.fallbackFormat || '[${seg0}] ${msg}';
  const context: Context = {
    branch,
    segs,
    ticket,
    msg: originalMessage,
    body: lines.join('\n')
  };

  const renderedMessage = renderTemplate(template, context);

  return {
    config: config as any, // Type compatibility
    commitMsgPath: '/mock/path', // Browser mock
    source: undefined,
    branch,
    ticket,
    originalMessage,
    lines,
    context: context as any, // Type compatibility
    template,
    renderedMessage,
    shouldSkip: false,
    isDryRun: false,
    debug: false
  };
};

// =============================================================================
// Main Preview Function
// =============================================================================

export const generatePreview = (
  config: CommitFromBranchConfig,
  branch: string,
  originalMessage: string = ''
): ProcessingState => {
  // Create browser-compatible preview state
  const state = createPreviewState(config, branch, originalMessage);

  // Apply basic validation
  if (!branch || branch === 'HEAD') {
    return { ...state, shouldSkip: true, skipReason: 'no branch or detached HEAD' };
  }

  const includePatterns = Array.isArray(config.includePattern)
    ? config.includePattern
    : [config.includePattern || '*'];

  if (!matchesAnyPattern(branch, includePatterns)) {
    return { ...state, shouldSkip: true, skipReason: 'includePattern mismatch' };
  }

  // Apply message processing logic
  const hasMessageToken = /\$\{msg\}|\$\{body\}/.test(state.template);

  if (hasMessageToken) {
    if (originalMessage === state.renderedMessage) {
      return { ...state, shouldSkip: true, skipReason: 'message already matches template' };
    }
    return { ...state, lines: [state.renderedMessage, ...state.lines.slice(1)] };
  } else {
    // Prefix mode - check for duplicates
    const escaped = escapeRegexSpecialChars(state.renderedMessage);

    if (new RegExp('^\\s*' + escaped, 'i').test(originalMessage)) {
      return { ...state, shouldSkip: true, skipReason: 'prefix already exists' };
    }

    if (state.ticket && new RegExp(`\\b${escapeRegexSpecialChars(state.ticket)}\\b`, 'i').test(originalMessage)) {
      return { ...state, shouldSkip: true, skipReason: 'ticket already in message' };
    }

    const firstSeg = state.context.segs[0];
    if (firstSeg && firstSeg !== 'HEAD' &&
        new RegExp(`\\b${escapeRegexSpecialChars(firstSeg)}\\b`, 'i').test(originalMessage)) {
      return { ...state, shouldSkip: true, skipReason: 'branch segment already in message' };
    }

    return {
      ...state,
      lines: [state.renderedMessage + originalMessage, ...state.lines.slice(1)]
    };
  }
};

// Re-export for compatibility
export {
  createRegexPattern,
  matchesAnyPattern,
  extractTicketFromBranch
};