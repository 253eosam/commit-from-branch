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
