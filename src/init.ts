import fs from 'fs';
import path from 'path';

const HUSKY_FILE = 'prepare-commit-msg';
const HOOK_LINE = 'cfb "$1" "$2" "$3"';

interface HuskyState {
  huskyDir: string;
  hookPath: string;
  huskyExists: boolean;
  hookExists: boolean;
  currentContent?: string;
  hookPresent?: boolean;
}

type InitResult = {
  exitCode: number;
  message: string;
  action?: () => void;
};

const createHuskyState = (cwd: string): HuskyState => {
  const huskyDir = path.join(cwd, '.husky');
  const hookPath = path.join(huskyDir, HUSKY_FILE);
  const huskyExists = fs.existsSync(huskyDir);
  const hookExists = fs.existsSync(hookPath);

  let currentContent: string | undefined;
  let hookPresent: boolean | undefined;

  if (hookExists) {
    currentContent = fs.readFileSync(hookPath, 'utf8');
    hookPresent = currentContent.includes(HOOK_LINE);
  }

  return {
    huskyDir,
    hookPath,
    huskyExists,
    hookExists,
    currentContent,
    hookPresent
  };
};

const initStrategies: Array<(state: HuskyState) => InitResult | null> = [
  (state) => !state.huskyExists ? {
    exitCode: 1,
    message: [
      '[cfb] Husky not found. This package requires Husky v9 as a peer dependency.',
      '',
      '  Install and initialize Husky v9:',
      '    npm install --save-dev husky@^9.0.0',
      '    npm exec husky init',
      '',
      '  Then run: cfb init'
    ].join('\n')
  } : null,

  (state) => !state.hookExists ? {
    exitCode: 0,
    message: '[cfb] ✓ Created .husky/prepare-commit-msg and added cfb hook',
    action: () => {
      fs.writeFileSync(state.hookPath, HOOK_LINE, 'utf8');
      fs.chmodSync(state.hookPath, 0o755);
    }
  } : null,

  (state) => state.hookPresent ? {
    exitCode: 0,
    message: '[cfb] ✓ Hook already present'
  } : null,

  (state) => ({
    exitCode: 0,
    message: '[cfb] ✓ Appended cfb hook to existing prepare-commit-msg',
    action: () => {
      const updated = state.currentContent!.trimEnd() + `\n\n${HOOK_LINE}\n`;
      fs.writeFileSync(state.hookPath, updated, 'utf8');
    }
  })
];

const applyInitStrategy = (state: HuskyState): InitResult => {
  for (const strategy of initStrategies) {
    const result = strategy(state);
    if (result) return result;
  }

  return { exitCode: 1, message: '[cfb] unexpected error' };
};

export function initHusky(cwd = process.cwd()): number {
  const state = createHuskyState(cwd);
  const result = applyInitStrategy(state);

  result.action?.();
  console.log(result.message);

  return result.exitCode;
}
