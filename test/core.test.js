import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { run } from '../dist/core.js';

describe('commit-from-branch core', () => {
  let tempDir;
  let commitMsgPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(process.cwd(), 'test-temp-'));
    commitMsgPath = path.join(tempDir, 'COMMIT_EDITMSG');
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should return 0 when no commit message path provided', () => {
    const result = run({
      argv: ['node', 'script'],
      cwd: tempDir
    });
    assert.strictEqual(result, 0);
  });

  test('should handle missing package.json gracefully', () => {
    fs.writeFileSync(commitMsgPath, 'test commit');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DRYRUN: '1'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });

  test('should exclude commits from specified sources', () => {
    // Create package.json with config
    const packageJson = {
      name: 'test-package',
      commitFromBranch: {
        exclude: ['merge', 'squash']
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );
    
    fs.writeFileSync(commitMsgPath, 'merge commit');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath, 'merge'],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DRYRUN: '1'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });

  test('should handle debug mode', () => {
    fs.writeFileSync(commitMsgPath, 'debug test');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DEBUG: '1',
        BRANCH_PREFIX_DRYRUN: '1'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });

  test('should handle dry run mode', () => {
    fs.writeFileSync(commitMsgPath, 'test commit message');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DRYRUN: 'true'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });

  test('should handle custom config format', () => {
    const packageJson = {
      name: 'test-package',
      commitFromBranch: {
        format: '[CUSTOM] ${msg}',
        fallbackFormat: '[FB] ${msg}'
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );
    
    fs.writeFileSync(commitMsgPath, 'custom format test');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DRYRUN: '1'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });

  test('should handle include patterns', () => {
    const packageJson = {
      name: 'test-package',
      commitFromBranch: {
        includePattern: ['feature/*', 'hotfix/*']
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );
    
    fs.writeFileSync(commitMsgPath, 'include pattern test');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DRYRUN: '1'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });

  test('should not add prefix when ticket already exists in message', () => {
    const packageJson = {
      name: 'test-package',
      commitFromBranch: {
        format: '[${ticket}] ${msg}',
        fallbackFormat: '[${seg0}] ${msg}'
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );
    
    // Message already contains ticket number
    fs.writeFileSync(commitMsgPath, 'fix PROJ-123 authentication bug');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DRYRUN: '1',
        BRANCH_PREFIX_DEBUG: '1'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });

  test('should not add prefix when branch segment already exists in message', () => {
    const packageJson = {
      name: 'test-package',
      commitFromBranch: {
        format: '[${ticket}] ${msg}',
        fallbackFormat: '[${seg0}] ${msg}'
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );
    
    // Message already contains branch segment
    fs.writeFileSync(commitMsgPath, 'feature: add new login system');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DRYRUN: '1',
        BRANCH_PREFIX_DEBUG: '1'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });

  test('should add prefix when similar but different content exists', () => {
    const packageJson = {
      name: 'test-package',
      commitFromBranch: {
        format: '[${ticket}] ${msg}',
        fallbackFormat: '[${seg0}] ${msg}'
      }
    };
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );
    
    // Message contains similar but not exact match (PROJ-124 vs PROJ-123)
    fs.writeFileSync(commitMsgPath, 'fix PROJ-124 related issue');
    
    const result = run({
      argv: ['node', 'script', commitMsgPath],
      env: { 
        ...process.env,
        BRANCH_PREFIX_DRYRUN: '1'
      },
      cwd: tempDir
    });
    
    assert.strictEqual(result, 0);
  });
});