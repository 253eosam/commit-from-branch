import { test, describe } from 'node:test';
import assert from 'node:assert';

// Import web-preview core functions
// These are browser-compatible versions that should work the same as the main package
import { renderTemplate } from '../web-preview/src/core.ts';

describe('Web Preview - renderTemplate', () => {
  const context = {
    branch: 'legacy-contentsvod/CONP-1518',
    segs: ['legacy-contentsvod', 'CONP-1518'],
    ticket: 'CONP-1518',
    msg: 'add new feature',
    body: 'add new feature\n\nDetailed description'
  };

  test('should replace ticket token', () => {
    const result = renderTemplate('[${ticket}] ${msg}', context);
    assert.strictEqual(result, '[CONP-1518] add new feature');
  });

  test('should replace branch token', () => {
    const result = renderTemplate('${branch}: ${msg}', context);
    assert.strictEqual(result, 'legacy-contentsvod/CONP-1518: add new feature');
  });

  test('should replace seg0 token (NOT segs[0])', () => {
    const result = renderTemplate('[${seg0}] ${msg}', context);
    assert.strictEqual(result, '[legacy-contentsvod] add new feature');
  });

  test('should replace seg1 token (NOT segs[1])', () => {
    const result = renderTemplate('[${seg1}] ${msg}', context);
    assert.strictEqual(result, '[CONP-1518] add new feature');
  });

  test('should NOT replace segs[0] - incorrect syntax', () => {
    const result = renderTemplate('[${segs[0]}] ${msg}', context);
    // segs[0] is not a valid token, so it should remain unchanged
    assert.strictEqual(result, '[${segs[0]}] add new feature');
  });

  test('should replace segments token', () => {
    const result = renderTemplate('${segments}: ${msg}', context);
    assert.strictEqual(result, 'legacy-contentsvod/CONP-1518: add new feature');
  });

  test('should replace prefix:1 token', () => {
    const result = renderTemplate('[${prefix:1}] ${msg}', context);
    assert.strictEqual(result, '[legacy-contentsvod] add new feature');
  });

  test('should replace prefix:2 token', () => {
    const result = renderTemplate('[${prefix:2}] ${msg}', context);
    assert.strictEqual(result, '[legacy-contentsvod/CONP-1518] add new feature');
  });

  test('should handle missing segment indices', () => {
    const result = renderTemplate('${seg5}', context);
    assert.strictEqual(result, '');
  });

  test('should replace body token', () => {
    const result = renderTemplate('${body}', context);
    assert.strictEqual(result, 'add new feature\n\nDetailed description');
  });

  test('should handle complex template with multiple tokens', () => {
    const template = '[${ticket}] ${seg0}: ${msg}\n\nBranch: ${branch}\nSegments: ${segments}';
    const result = renderTemplate(template, context);
    const expected = '[CONP-1518] legacy-contentsvod: add new feature\n\nBranch: legacy-contentsvod/CONP-1518\nSegments: legacy-contentsvod/CONP-1518';
    assert.strictEqual(result, expected);
  });

  test('should handle three-segment branch', () => {
    const threeSegContext = {
      branch: 'feature/ABC-123/user-auth',
      segs: ['feature', 'ABC-123', 'user-auth'],
      ticket: 'ABC-123',
      msg: 'implement login',
      body: 'implement login'
    };

    assert.strictEqual(renderTemplate('${seg0}', threeSegContext), 'feature');
    assert.strictEqual(renderTemplate('${seg1}', threeSegContext), 'ABC-123');
    assert.strictEqual(renderTemplate('${seg2}', threeSegContext), 'user-auth');
    assert.strictEqual(renderTemplate('${prefix:1}', threeSegContext), 'feature');
    assert.strictEqual(renderTemplate('${prefix:2}', threeSegContext), 'feature/ABC-123');
    assert.strictEqual(renderTemplate('${prefix:3}', threeSegContext), 'feature/ABC-123/user-auth');
    assert.strictEqual(renderTemplate('${segments}', threeSegContext), 'feature/ABC-123/user-auth');
  });

  test('should handle empty tokens gracefully', () => {
    const emptyContext = {
      branch: '',
      segs: [],
      ticket: '',
      msg: '',
      body: ''
    };
    const result = renderTemplate('[${ticket}] ${msg}', emptyContext);
    assert.strictEqual(result, '[] ');
  });
});

describe('Web Preview - Token Compatibility', () => {
  test('web-preview should use same token syntax as main package', () => {
    const context = {
      branch: 'bugfix/PROJ-456-fix-bug',
      segs: ['bugfix', 'PROJ-456-fix-bug'],
      ticket: 'PROJ-456',
      msg: 'fix critical bug',
      body: 'fix critical bug'
    };

    // These should work
    const validTokens = [
      { template: '${ticket}', expected: 'PROJ-456' },
      { template: '${seg0}', expected: 'bugfix' },
      { template: '${seg1}', expected: 'PROJ-456-fix-bug' },
      { template: '${segments}', expected: 'bugfix/PROJ-456-fix-bug' },
      { template: '${prefix:1}', expected: 'bugfix' },
      { template: '${branch}', expected: 'bugfix/PROJ-456-fix-bug' },
      { template: '${msg}', expected: 'fix critical bug' }
    ];

    validTokens.forEach(({ template, expected }) => {
      const result = renderTemplate(template, context);
      assert.strictEqual(result, expected, `Token ${template} should work`);
    });

    // These should NOT work (invalid syntax)
    const invalidTokens = [
      '${segs[0]}',
      '${segs[1]}',
      '${segs}'
    ];

    invalidTokens.forEach((template) => {
      const result = renderTemplate(template, context);
      // Invalid tokens should remain unchanged in the output
      assert.strictEqual(result, template, `Token ${template} should not be replaced`);
    });
  });
});
