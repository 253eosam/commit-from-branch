type CommitFromBranchConfig = {
    includePattern?: string | string[];
    format?: string;
    fallbackFormat?: string;
    exclude?: string[];
};
type Context = {
    branch: string;
    segs: string[];
    ticket: string;
    msg: string;
    body: string;
};
type RunOptions = {
    argv?: string[];
    env?: NodeJS.ProcessEnv;
    cwd?: string;
};
type ProcessingState = {
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
type ValidationRule = {
    name: string;
    check: (state: ProcessingState) => boolean;
    reason: string;
};
type MessageProcessor = {
    name: string;
    shouldApply: (state: ProcessingState) => boolean;
    process: (state: ProcessingState) => ProcessingState;
};

declare function renderTemplate(tpl: string, ctx: Context): string;

declare const createInitialState: (opts?: RunOptions) => ProcessingState | null;
declare const validationRules: ValidationRule[];
declare const messageProcessors: MessageProcessor[];
declare const applyValidationRules: (state: ProcessingState) => ProcessingState;
declare const processMessage: (state: ProcessingState) => ProcessingState;
declare function run(opts?: RunOptions): number;

export { type CommitFromBranchConfig, type Context, type MessageProcessor, type ProcessingState, type RunOptions, type ValidationRule, applyValidationRules, createInitialState, messageProcessors, processMessage, renderTemplate, run, validationRules };
