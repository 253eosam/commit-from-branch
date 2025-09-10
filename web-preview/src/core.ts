// Browser-compatible version of commit-from-branch core logic
import { renderTemplate } from './tokens';

// =============================================================================
// Types (adapted from original types.ts)
// =============================================================================

export type CommitFromBranchConfig = {
  includePattern?: string | string[];
  format?: string;
  fallbackFormat?: string;
  exclude?: string[];
};

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

export type PreviewState = {
  config: ProcessedConfig;
  branch: string;
  ticket: string;
  originalMessage: string;
  lines: string[];
  context: Context;
  template: string;
  renderedMessage: string;
  shouldSkip: boolean;
  skipReason?: string;
};

export type ValidationRule = {
  name: string;
  check: (state: PreviewState) => boolean;
  reason: string;
};

export type MessageProcessor = {
  name: string;
  shouldApply: (state: PreviewState) => boolean;
  process: (state: PreviewState) => PreviewState;
};

// =============================================================================
// Utility Functions (adapted for browser)
// =============================================================================

const createRegexPattern = (pattern: string): RegExp =>
  new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i');

const matchesAnyPattern = (value: string, patterns: string[]): boolean =>
  patterns.some(pattern => createRegexPattern(pattern).test(value));

const extractTicketFromBranch = (branch: string): string =>
  (branch.match(/([A-Z]+-\d+)/i)?.[1] || '').toUpperCase();

const escapeRegexSpecialChars = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeConfig = (config: CommitFromBranchConfig): ProcessedConfig => {
  const includePattern = config.includePattern || ['*'];
  const includePatterns = Array.isArray(includePattern) ? includePattern : [includePattern];

  return {
    ...config,
    includePatterns,
    format: config.format || '${ticket}: ${msg}',
    fallbackFormat: config.fallbackFormat || '${segs[0]}: ${msg}',
    exclude: config.exclude || []
  };
};

// =============================================================================
// State Creation
// =============================================================================

export const createPreviewState = (
  config: CommitFromBranchConfig,
  branch: string,
  originalMessage: string = ''
): PreviewState => {
  const normalizedConfig = normalizeConfig(config);
  const ticket = extractTicketFromBranch(branch);
  const lines = originalMessage.split('\n');
  const segs = branch.split('/');
  
  const template = ticket ? normalizedConfig.format : normalizedConfig.fallbackFormat;
  const context: Context = { 
    branch, 
    segs, 
    ticket, 
    msg: originalMessage, 
    body: lines.join('\n') 
  };
  const renderedMessage = renderTemplate(template, context);

  return {
    config: normalizedConfig,
    branch,
    ticket,
    originalMessage,
    lines,
    context,
    template,
    renderedMessage,
    shouldSkip: false
  };
};

// =============================================================================
// Validation Rules (adapted from original)
// =============================================================================

export const validationRules: ValidationRule[] = [
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
// Message Processors (adapted from original)
// =============================================================================

export const messageProcessors: MessageProcessor[] = [
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
      
      // Check if prefix already exists
      if (new RegExp('^\\s*' + escaped, 'i').test(state.originalMessage)) {
        return { ...state, shouldSkip: true, skipReason: 'prefix already exists' };
      }
      
      // Check if ticket is already in message
      if (state.ticket) {
        const ticketRegex = new RegExp(`\\b${escapeRegexSpecialChars(state.ticket)}\\b`, 'i');
        if (ticketRegex.test(state.originalMessage)) {
          return { ...state, shouldSkip: true, skipReason: 'ticket already in message' };
        }
      }
      
      // Check if branch segment is already in message
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
// Processing Pipeline
// =============================================================================

const applyValidationRules = (state: PreviewState): PreviewState => {
  for (const rule of validationRules) {
    if (!rule.check(state)) {
      return { ...state, shouldSkip: true, skipReason: rule.reason };
    }
  }
  return state;
};

const processMessage = (state: PreviewState): PreviewState => {
  if (state.shouldSkip) return state;
  
  const applicableProcessor = messageProcessors.find(processor => 
    processor.shouldApply(state)
  );
  
  if (!applicableProcessor) {
    return { ...state, shouldSkip: true, skipReason: 'no applicable processor' };
  }
  
  return applicableProcessor.process(state);
};

const pipe = <T>(...functions: Array<(arg: T) => T>) => (value: T): T =>
  functions.reduce((acc, fn) => fn(acc), value);

// =============================================================================
// Main Preview Function
// =============================================================================

export const generatePreview = (
  config: CommitFromBranchConfig,
  branch: string,
  originalMessage: string = ''
): PreviewState => {
  const initialState = createPreviewState(config, branch, originalMessage);
  
  const pipeline = pipe(
    applyValidationRules,
    processMessage
  );
  
  return pipeline(initialState);
};

// =============================================================================
// Exports
// =============================================================================

export {
  applyValidationRules,
  processMessage,
  createRegexPattern,
  matchesAnyPattern,
  extractTicketFromBranch
};