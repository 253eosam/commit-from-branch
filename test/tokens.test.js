import { test, describe } from 'node:test';
import assert from 'node:assert';

// Helper function that replicates renderTemplate logic for testing
function renderTemplate(tpl, ctx) {
  let out = String(tpl);
  
  // ${prefix:n} → 앞 n개 세그먼트 join('/')
  out = out.replace(/\$\{prefix:(\d+)\}/g, (_m, n) => {
    const k = Math.max(0, parseInt(n, 10) || 0);
    return ctx.segs.slice(0, k).join('/') || '';
  });

  // ${seg0}, ${seg1}, ...
  out = out.replace(/\$\{seg(\d+)\}/g, (_m, i) => {
    const idx = parseInt(i, 10) || 0;
    return ctx.segs[idx] || '';
  });

  return out
    .replace(/\$\{ticket\}/g, ctx.ticket || '')
    .replace(/\$\{branch\}/g, ctx.branch || '')
    .replace(/\$\{segments\}/g, ctx.segs.join('/'))
    .replace(/\$\{msg\}/g, ctx.msg || '')
    .replace(/\$\{body\}/g, ctx.body || '');
}

describe('renderTemplate', () => {
  const context = {
    branch: 'feature/PROJ-123-new-login-page',
    segs: ['feature', 'PROJ-123-new-login-page'],
    ticket: 'PROJ-123',
    msg: 'add user authentication',
    body: 'add user authentication\n\nImplemented OAuth integration'
  };

  test('should replace ticket token', () => {
    const result = renderTemplate('[${ticket}] ${msg}', context);
    assert.strictEqual(result, '[PROJ-123] add user authentication');
  });

  test('should replace branch token', () => {
    const result = renderTemplate('${branch}: ${msg}', context);
    assert.strictEqual(result, 'feature/PROJ-123-new-login-page: add user authentication');
  });

  test('should replace segment tokens', () => {
    const result = renderTemplate('[${seg0}/${seg1}] ${msg}', context);
    assert.strictEqual(result, '[feature/PROJ-123-new-login-page] add user authentication');
  });

  test('should replace segments token', () => {
    const result = renderTemplate('${segments}: ${msg}', context);
    assert.strictEqual(result, 'feature/PROJ-123-new-login-page: add user authentication');
  });

  test('should replace prefix token with count', () => {
    const result = renderTemplate('[${prefix:1}] ${msg}', context);
    assert.strictEqual(result, '[feature] add user authentication');
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

  test('should handle missing segment indices', () => {
    const result = renderTemplate('${seg5}', context);
    assert.strictEqual(result, '');
  });

  test('should replace body token', () => {
    const result = renderTemplate('${body}', context);
    assert.strictEqual(result, 'add user authentication\n\nImplemented OAuth integration');
  });

  test('should handle complex template with multiple tokens', () => {
    const template = '[${ticket}] ${seg0}: ${msg}\n\nBranch: ${branch}\nSegments: ${segments}';
    const result = renderTemplate(template, context);
    const expected = '[PROJ-123] feature: add user authentication\n\nBranch: feature/PROJ-123-new-login-page\nSegments: feature/PROJ-123-new-login-page';
    assert.strictEqual(result, expected);
  });
});