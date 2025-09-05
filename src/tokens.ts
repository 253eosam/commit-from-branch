import type { Context } from './types';

export function renderTemplate(tpl: string, ctx: Context) {
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
