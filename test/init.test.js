import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { initHusky } from '../dist/init.js';

describe('initHusky', () => {
  let tempDir;
  let huskyDir;
  let hookPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(process.cwd(), 'init-test-'));
    huskyDir = path.join(tempDir, '.husky');
    hookPath = path.join(huskyDir, 'prepare-commit-msg');
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should return 1 when .husky directory does not exist', () => {
    const result = initHusky(tempDir);
    assert.strictEqual(result, 1);
  });

  test('should create new hook file when .husky exists but no hook file', () => {
    fs.mkdirSync(huskyDir);
    
    const result = initHusky(tempDir);
    
    assert.strictEqual(result, 0);
    assert.strictEqual(fs.existsSync(hookPath), true);
    
    const content = fs.readFileSync(hookPath, 'utf8');
    assert.strictEqual(content.includes('cfb "$1" "$2" "$3"'), true);
    
    // Check file permissions (should be executable)
    const stats = fs.statSync(hookPath);
    assert.strictEqual((stats.mode & 0o755) !== 0, true);
  });

  test('should return 0 when hook already exists and contains cfb command', () => {
    fs.mkdirSync(huskyDir);
    fs.writeFileSync(hookPath, '#!/bin/sh\ncfb "$1" "$2" "$3"\n', 'utf8');
    
    const result = initHusky(tempDir);
    
    assert.strictEqual(result, 0);
  });

  test('should append cfb command to existing hook file', () => {
    fs.mkdirSync(huskyDir);
    const existingContent = '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\n\necho "existing hook"';
    fs.writeFileSync(hookPath, existingContent, 'utf8');
    
    const result = initHusky(tempDir);
    
    assert.strictEqual(result, 0);
    
    const content = fs.readFileSync(hookPath, 'utf8');
    assert.strictEqual(content.includes('cfb "$1" "$2" "$3"'), true);
    assert.strictEqual(content.includes('existing hook'), true);
  });

  test('should handle existing hook file without trailing newline', () => {
    fs.mkdirSync(huskyDir);
    const existingContent = '#!/bin/sh\necho "no trailing newline"';
    fs.writeFileSync(hookPath, existingContent, 'utf8');
    
    const result = initHusky(tempDir);
    
    assert.strictEqual(result, 0);
    
    const content = fs.readFileSync(hookPath, 'utf8');
    assert.strictEqual(content.includes('cfb "$1" "$2" "$3"'), true);
    
    // Should have proper spacing between old content and new command
    const lines = content.split('\n');
    const cfbLineIndex = lines.findIndex(line => line.includes('cfb "$1" "$2" "$3"'));
    assert.strictEqual(cfbLineIndex > 0, true);
    assert.strictEqual(lines[cfbLineIndex - 1], ''); // Should have empty line before cfb command
  });

  test('should not duplicate cfb command if already present', () => {
    fs.mkdirSync(huskyDir);
    const existingContent = '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\n\ncfb "$1" "$2" "$3"\necho "after cfb"';
    fs.writeFileSync(hookPath, existingContent, 'utf8');
    
    const result = initHusky(tempDir);
    
    assert.strictEqual(result, 0);
    
    const content = fs.readFileSync(hookPath, 'utf8');
    const matches = content.match(/cfb "\$1" "\$2" "\$3"/g);
    assert.strictEqual(matches.length, 1); // Should only appear once
  });
});