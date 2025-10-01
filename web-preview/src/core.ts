// Browser-compatible wrapper - uses parent package core logic
import type {
  ProcessingState,
  CommitFromBranchConfig as OriginalConfig,
  Context as OriginalContext
} from '../../dist/core.js';

// Import renderTemplate from built parent package
import { renderTemplate as parentRenderTemplate } from '../../dist/core.js';

// Re-export types for compatibility
export type CommitFromBranchConfig = OriginalConfig;
export type Context = OriginalContext;

export type ProcessedConfig = CommitFromBranchConfig & {
  includePatterns: string[];
  format: string;
  fallbackFormat: string;
  exclude: string[];
};

export type PreviewState = ProcessingState;

// =============================================================================
// Utility functions (minimal browser adaptations)
// =============================================================================

const createRegexPattern = (pattern: string): RegExp =>
  new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');

const matchesAnyPattern = (value: string, patterns: string[]): boolean =>
  patterns.some(pattern => createRegexPattern(pattern).test(value));

const extractTicketFromBranch = (branch: string): string =>
  (branch.match(/([A-Z]+-\d+)/i)?.[1] || '').toUpperCase();

const escapeRegexSpecialChars = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Re-export renderTemplate from parent package
export const renderTemplate = parentRenderTemplate;

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
// Main Preview Function (uses same logic as parent package)
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

  // Apply message processing logic (SAME AS PARENT CORE)
  const hasMessageToken = /\$\{msg\}|\$\{body\}/.test(state.template);

  if (hasMessageToken) {
    // Template replacement mode
    if (originalMessage === state.renderedMessage) {
      return { ...state, shouldSkip: true, skipReason: 'message already matches template' };
    }

    // Check if ticket already exists in message (even in template replacement mode)
    if (state.ticket && new RegExp(`\\b${escapeRegexSpecialChars(state.ticket)}\\b`, 'i').test(originalMessage)) {
      return { ...state, shouldSkip: true, skipReason: 'ticket already in message' };
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
