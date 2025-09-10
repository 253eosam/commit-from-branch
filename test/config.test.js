import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

// Helper function that replicates loadConfig logic for testing
function loadConfig(cwd) {
  const DEFAULTS = {
    includePatterns: ['*'],
    format: '[${ticket}] ${msg}',
    fallbackFormat: '[${seg0}] ${msg}',
    exclude: ['merge', 'squash', 'revert']
  };

  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
    const pkgCfg = pkg.commitFromBranch;
    const cfg = (pkgCfg ?? {});
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

describe('loadConfig', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(process.cwd(), 'config-test-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should return defaults when no package.json exists', () => {
    const config = loadConfig(tempDir);
    
    assert.deepStrictEqual(config, {
      includePatterns: ['*'],
      format: '[${ticket}] ${msg}',
      fallbackFormat: '[${seg0}] ${msg}',
      exclude: ['merge', 'squash', 'revert']
    });
  });

  test('should return defaults when package.json has no config', () => {
    const packageJson = {
      name: 'test-package',
      version: '1.0.0'
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const config = loadConfig(tempDir);
    
    assert.deepStrictEqual(config, {
      includePatterns: ['*'],
      format: '[${ticket}] ${msg}',
      fallbackFormat: '[${seg0}] ${msg}',
      exclude: ['merge', 'squash', 'revert']
    });
  });

  test('should load custom config from package.json', () => {
    const packageJson = {
      name: 'test-package',
      version: '1.0.0',
      commitFromBranch: {
        includePattern: ['feature/*', 'hotfix/*'],
        format: '${ticket}: ${msg}',
        fallbackFormat: '${branch} - ${msg}',
        exclude: ['merge']
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const config = loadConfig(tempDir);
    
    assert.deepStrictEqual(config, {
      includePatterns: ['feature/*', 'hotfix/*'],
      format: '${ticket}: ${msg}',
      fallbackFormat: '${branch} - ${msg}',
      exclude: ['merge']
    });
  });

  test('should handle single includePattern as string', () => {
    const packageJson = {
      name: 'test-package',
      version: '1.0.0',
      commitFromBranch: {
        includePattern: 'feature/*'
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const config = loadConfig(tempDir);
    
    assert.deepStrictEqual(config.includePatterns, ['feature/*']);
  });

  test('should merge partial config with defaults', () => {
    const packageJson = {
      name: 'test-package',
      version: '1.0.0',
      commitFromBranch: {
        format: 'CUSTOM: ${msg}'
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const config = loadConfig(tempDir);
    
    assert.strictEqual(config.format, 'CUSTOM: ${msg}');
    assert.strictEqual(config.fallbackFormat, '[${seg0}] ${msg}'); // should use default
    assert.deepStrictEqual(config.exclude, ['merge', 'squash', 'revert']); // should use default
  });

  test('should handle malformed package.json gracefully', () => {
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      '{ invalid json }'
    );

    const config = loadConfig(tempDir);
    
    assert.deepStrictEqual(config, {
      includePatterns: ['*'],
      format: '[${ticket}] ${msg}',
      fallbackFormat: '[${seg0}] ${msg}',
      exclude: ['merge', 'squash', 'revert']
    });
  });
});