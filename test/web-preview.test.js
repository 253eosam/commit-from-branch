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

describe('Web Preview - Basic Scenarios', () => {
  test('should handle simple ticket extraction', () => {
    const context = {
      branch: 'feature/ABC-123',
      segs: ['feature', 'ABC-123'],
      ticket: 'ABC-123',
      msg: 'add login',
      body: 'add login'
    };

    const result = renderTemplate('[${ticket}] ${msg}', context);
    assert.strictEqual(result, '[ABC-123] add login');
  });

  test('should handle branch without ticket using fallback', () => {
    const context = {
      branch: 'feature/new-auth',
      segs: ['feature', 'new-auth'],
      ticket: '',
      msg: 'implement oauth',
      body: 'implement oauth'
    };

    const result = renderTemplate('[${seg0}] ${msg}', context);
    assert.strictEqual(result, '[feature] implement oauth');
  });

  test('should handle single segment branch', () => {
    const context = {
      branch: 'main',
      segs: ['main'],
      ticket: '',
      msg: 'fix typo',
      body: 'fix typo'
    };

    assert.strictEqual(renderTemplate('${seg0}: ${msg}', context), 'main: fix typo');
    assert.strictEqual(renderTemplate('${seg1}', context), '');
  });

  test('should handle typical Jira ticket format', () => {
    const context = {
      branch: 'bugfix/PROJ-456-critical-fix',
      segs: ['bugfix', 'PROJ-456-critical-fix'],
      ticket: 'PROJ-456',
      msg: 'resolve memory leak',
      body: 'resolve memory leak'
    };

    assert.strictEqual(renderTemplate('${ticket}: ${msg}', context), 'PROJ-456: resolve memory leak');
    assert.strictEqual(renderTemplate('[${ticket}] ${msg}', context), '[PROJ-456] resolve memory leak');
  });

  test('should handle simple prefix patterns', () => {
    const context = {
      branch: 'feature/user-management/authentication',
      segs: ['feature', 'user-management', 'authentication'],
      ticket: '',
      msg: 'add 2FA',
      body: 'add 2FA'
    };

    assert.strictEqual(renderTemplate('${prefix:1}: ${msg}', context), 'feature: add 2FA');
    assert.strictEqual(renderTemplate('${prefix:2}/${msg}', context), 'feature/user-management/add 2FA');
  });
});

describe('Web Preview - Advanced Scenarios', () => {
  test('should handle complex multi-segment branches', () => {
    const context = {
      branch: 'epic/EPIC-100/feature/STORY-200/impl',
      segs: ['epic', 'EPIC-100', 'feature', 'STORY-200', 'impl'],
      ticket: 'EPIC-100',
      msg: 'complete implementation',
      body: 'complete implementation'
    };

    assert.strictEqual(renderTemplate('${seg0}/${seg1}/${seg3}: ${msg}', context), 'epic/EPIC-100/STORY-200: complete implementation');
    assert.strictEqual(renderTemplate('${prefix:2} -> ${ticket}: ${msg}', context), 'epic/EPIC-100 -> EPIC-100: complete implementation');
  });

  test('should handle mixed case ticket numbers', () => {
    const contexts = [
      {
        branch: 'fix/abc-123',
        segs: ['fix', 'abc-123'],
        ticket: 'ABC-123', // uppercase
        msg: 'patch',
        body: 'patch'
      },
      {
        branch: 'hotfix/XYZ-999',
        segs: ['hotfix', 'XYZ-999'],
        ticket: 'XYZ-999',
        msg: 'urgent fix',
        body: 'urgent fix'
      }
    ];

    contexts.forEach(ctx => {
      const result = renderTemplate('[${ticket}]', ctx);
      assert.ok(result.includes(ctx.ticket));
    });
  });

  test('should handle segments with special characters', () => {
    const context = {
      branch: 'feature/user-auth_v2.0',
      segs: ['feature', 'user-auth_v2.0'],
      ticket: '',
      msg: 'update',
      body: 'update'
    };

    assert.strictEqual(renderTemplate('${seg1}: ${msg}', context), 'user-auth_v2.0: update');
    assert.strictEqual(renderTemplate('${segments}', context), 'feature/user-auth_v2.0');
  });

  test('should handle multiline body with template', () => {
    const context = {
      branch: 'feature/DOC-500',
      segs: ['feature', 'DOC-500'],
      ticket: 'DOC-500',
      msg: 'update docs',
      body: 'update docs\n\nAdded:\n- API reference\n- Examples'
    };

    const result = renderTemplate('[${ticket}] ${body}', context);
    assert.strictEqual(result, '[DOC-500] update docs\n\nAdded:\n- API reference\n- Examples');
  });

  test('should handle complex template combinations', () => {
    const context = {
      branch: 'release/v2.0/PROJ-777',
      segs: ['release', 'v2.0', 'PROJ-777'],
      ticket: 'PROJ-777',
      msg: 'prepare release',
      body: 'prepare release'
    };

    const template = '${seg0}(${seg1})[${ticket}]: ${msg}';
    assert.strictEqual(renderTemplate(template, context), 'release(v2.0)[PROJ-777]: prepare release');
  });

  test('should preserve branch name exactly in ${branch} token', () => {
    const context = {
      branch: 'feature/ABC-123/user-auth-system',
      segs: ['feature', 'ABC-123', 'user-auth-system'],
      ticket: 'ABC-123',
      msg: 'implement',
      body: 'implement'
    };

    assert.strictEqual(renderTemplate('Branch: ${branch}', context), 'Branch: feature/ABC-123/user-auth-system');
  });
});

describe('Web Preview - Edge Cases', () => {
  test('should handle empty message', () => {
    const context = {
      branch: 'feature/TEST-1',
      segs: ['feature', 'TEST-1'],
      ticket: 'TEST-1',
      msg: '',
      body: ''
    };

    assert.strictEqual(renderTemplate('[${ticket}] ${msg}', context), '[TEST-1] ');
    assert.strictEqual(renderTemplate('${msg}', context), '');
  });

  test('should handle branch with only ticket number', () => {
    const context = {
      branch: 'ABC-123',
      segs: ['ABC-123'],
      ticket: 'ABC-123',
      msg: 'quick fix',
      body: 'quick fix'
    };

    assert.strictEqual(renderTemplate('${seg0}', context), 'ABC-123');
    assert.strictEqual(renderTemplate('${ticket}', context), 'ABC-123');
  });

  test('should handle very long branch names', () => {
    const longBranch = 'feature/PROJ-999/very-long-branch-name-with-many-segments/and-more/and-even-more';
    const context = {
      branch: longBranch,
      segs: longBranch.split('/'),
      ticket: 'PROJ-999',
      msg: 'test',
      body: 'test'
    };

    assert.strictEqual(renderTemplate('${segments}', context), longBranch);
    assert.strictEqual(renderTemplate('${prefix:3}', context), 'feature/PROJ-999/very-long-branch-name-with-many-segments');
  });

  test('should handle branch without any segments', () => {
    const context = {
      branch: '',
      segs: [],
      ticket: '',
      msg: 'commit',
      body: 'commit'
    };

    assert.strictEqual(renderTemplate('${seg0}', context), '');
    assert.strictEqual(renderTemplate('${segments}', context), '');
    assert.strictEqual(renderTemplate('${prefix:1}', context), '');
  });

  test('should handle prefix with count exceeding segments length', () => {
    const context = {
      branch: 'feature/test',
      segs: ['feature', 'test'],
      ticket: '',
      msg: 'commit',
      body: 'commit'
    };

    assert.strictEqual(renderTemplate('${prefix:10}', context), 'feature/test');
    assert.strictEqual(renderTemplate('${prefix:100}', context), 'feature/test');
  });

  test('should handle prefix with zero count', () => {
    const context = {
      branch: 'feature/test',
      segs: ['feature', 'test'],
      ticket: '',
      msg: 'commit',
      body: 'commit'
    };

    assert.strictEqual(renderTemplate('${prefix:0}', context), '');
  });

  test('should handle special characters in message', () => {
    const context = {
      branch: 'feature/PROJ-100',
      segs: ['feature', 'PROJ-100'],
      ticket: 'PROJ-100',
      msg: 'fix: resolve ${issue} with <brackets> and "quotes"',
      body: 'fix: resolve ${issue} with <brackets> and "quotes"'
    };

    const result = renderTemplate('[${ticket}] ${msg}', context);
    assert.strictEqual(result, '[PROJ-100] fix: resolve ${issue} with <brackets> and "quotes"');
  });

  test('should not replace tokens inside message content', () => {
    const context = {
      branch: 'feature/TEST-1',
      segs: ['feature', 'TEST-1'],
      ticket: 'TEST-1',
      msg: 'update template to use ${ticket} variable',
      body: 'update template to use ${ticket} variable'
    };

    const result = renderTemplate('${ticket}: ${msg}', context);
    // The ${ticket} in the message should remain unchanged
    assert.strictEqual(result, 'TEST-1: update template to use ${ticket} variable');
  });

  test('should handle numeric-only segment names', () => {
    const context = {
      branch: 'release/2024/v1.2.3',
      segs: ['release', '2024', 'v1.2.3'],
      ticket: '',
      msg: 'version bump',
      body: 'version bump'
    };

    assert.strictEqual(renderTemplate('${seg0}/${seg1}/${seg2}', context), 'release/2024/v1.2.3');
  });

  test('should handle unicode characters in branch names', () => {
    const context = {
      branch: 'feature/문서-업데이트',
      segs: ['feature', '문서-업데이트'],
      ticket: '',
      msg: '한글 커밋',
      body: '한글 커밋'
    };

    assert.strictEqual(renderTemplate('${seg0}: ${msg}', context), 'feature: 한글 커밋');
    assert.strictEqual(renderTemplate('${seg1}', context), '문서-업데이트');
  });

  test('should handle message that already contains ticket number', () => {
    const context = {
      branch: 'feature/DEF-789/api-refactor',
      segs: ['feature', 'DEF-789', 'api-refactor'],
      ticket: 'DEF-789',
      msg: 'DEF-789: refactor user API endpoints',
      body: 'DEF-789: refactor user API endpoints'
    };

    // Even if template adds ticket, the message already has it
    const result1 = renderTemplate('[${ticket}] ${msg}', context);
    assert.strictEqual(result1, '[DEF-789] DEF-789: refactor user API endpoints');

    // This shows the ticket appears twice in template mode
    // In real usage, the core logic would skip this due to duplicate detection
    const result2 = renderTemplate('${ticket}: ${msg}', context);
    assert.strictEqual(result2, 'DEF-789: DEF-789: refactor user API endpoints');
  });
});
