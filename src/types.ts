export type CommitFromBranchConfig = {
  includePattern?: string | string[];
  format?: string;         // 예: "[${ticket}] ${msg}"
  fallbackFormat?: string; // 예: "[${seg0}] ${msg}"
  exclude?: string[];      // ["merge","squash","revert"]
};

export type Context = {
  branch: string;
  segs: string[];
  ticket: string;
  msg: string;
  body: string;
};

export type RunOptions = {
  argv?: string[];
  env?: NodeJS.ProcessEnv;
  cwd?: string;
};

// 새로운 함수형 타입들
export type ProcessingState = {
  commitMsgPath: string;
  source?: string;
  config: CommitFromBranchConfig & {
    includePatterns: string[];
    format: string;
    fallbackFormat: string;
    exclude: string[];
  };
  branch: string;
  ticket: string;
  originalMessage: string;
  lines: string[];
  context: Context;
  template: string;
  renderedMessage: string;
  shouldSkip: boolean;
  skipReason?: string;
  isDryRun: boolean;
  debug: boolean;
};

export type ProcessingStep<T = ProcessingState> = (state: T) => T;

export type ValidationRule = {
  name: string;
  check: (state: ProcessingState) => boolean;
  reason: string;
};

export type MessageProcessor = {
  name: string;
  shouldApply: (state: ProcessingState) => boolean;
  process: (state: ProcessingState) => ProcessingState;
};
