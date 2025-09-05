import fs from 'fs';
import path from 'path';
import type { CommitFromBranchConfig } from './types.js';

const DEFAULTS = {
  includePatterns: ['*'],
  format: '[${ticket}] ${msg}',
  fallbackFormat: '[${seg0}] ${msg}',
  exclude: ['merge', 'squash', 'revert']
};

export function loadConfig(cwd: string) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));

    // 새 키 우선, 없으면 구 키 사용
    const pkgCfg: CommitFromBranchConfig | undefined = pkg.commitFromBranch;

    const cfg = (pkgCfg ?? {}) as CommitFromBranchConfig;
    const include = cfg.includePattern ?? '*';

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
