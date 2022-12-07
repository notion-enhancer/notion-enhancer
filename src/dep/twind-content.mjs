/**
 * Twind v0.16.16
 * @license MIT
 * @source https://unpkg.com/@twind/content@0.1.0/content.js?module
 */

import { directive as o } from './twind.mjs';
var c = new Set([
    'open-quote',
    'close-quote',
    'no-open-quote',
    'no-close-quote',
    'normal',
    'none',
    'inherit',
    'initial',
    'unset',
  ]),
  n = (t) => t.join('-'),
  s = (t) => {
    switch (t[0]) {
      case 'data':
        return `attr(${n(t)})`;
      case 'attr':
      case 'counter':
        return `${t[0]}(${n(t.slice(1))})`;
      case 'var':
        return `var(--${n(t)})`;
      case void 0:
        return 'attr(data-content)';
      default:
        return JSON.stringify(n(t));
    }
  },
  i = (t, { theme: r }) => {
    let e = Array.isArray(t) ? n(t) : t;
    return {
      content:
        (e && r('content', [e], '')) || (c.has(e) && e) || (Array.isArray(t) ? s(t) : e),
    };
  },
  u = (t, r) => (Array.isArray(t) ? i(t, r) : o(i, t));
export { u as content };
