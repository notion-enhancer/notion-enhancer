/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * helpers for formatting or parsing text
 * @module notion-enhancer/api/fmt
 */

import '../dep/prism.min.js';
/** syntax highlighting using https://prismjs.com/ */
export const prism = Prism;
Prism.manual = true;
Prism.hooks.add('complete', async (event) => {
  event.element.parentElement.removeAttribute('tabindex');
  event.element.parentElement.parentElement
    .querySelector('.copy-to-clipboard-button')
    .prepend(web.createElement(await web.getIcon('fa/regular/copy')));
});

import '../dep/markdown-it.min.js';
/** markdown -> html using https://github.com/markdown-it/markdown-it/ */
export const md = new markdownit({
  linkify: true,
  highlight: (str, lang) =>
    web.html`<pre class="language-${lang || 'plaintext'} match-braces"><code>${web.escapeHtml(
      str
    )}</code></pre>`,
});
md.renderer.rules.code_block = (tokens, idx, options, env, slf) => {
  const attrIdx = tokens[idx].attrIndex('class');
  if (attrIdx === -1) {
    tokens[idx].attrPush(['class', 'match-braces language-plaintext']);
  } else tokens[idx].attrs[attrIdx][1] = 'match-braces language-plaintext';
  return web.html`<pre${slf.renderAttrs(tokens[idx])}><code>${web.escapeHtml(
    tokens[idx].content
  )}</code></pre>\n`;
};
md.core.ruler.push(
  'heading_ids',
  function (md, state) {
    const slugs = new Set();
    state.tokens.forEach(function (token, i) {
      if (token.type === 'heading_open') {
        const text = md.renderer.render(state.tokens[i + 1].children, md.options),
          slug = fmt.slugger(text, slugs);
        slugs.add(slug);
        const attrIdx = token.attrIndex('id');
        if (attrIdx === -1) {
          token.attrPush(['id', slug]);
        } else token.attrs[attrIdx][1] = slug;
      }
    });
  }.bind(null, md)
);

/**
 * transform a heading into a slug (a lowercase alphanumeric string separated by dashes),
 * e.g. for use as an anchor id
 * @param {string} heading - the original heading to be slugified
 * @param {Set<string>} [slugs] - a list of pre-generated slugs to avoid duplicates
 * @returns {string} the generated slug
 */
export const slugger = (heading, slugs = new Set()) => {
  heading = heading
    .replace(/\s/g, '-')
    .replace(/[^A-Za-z0-9-_]/g, '')
    .toLowerCase();
  let i = 0,
    slug = heading;
  while (slugs.has(slug)) {
    i++;
    slug = `${heading}-${i}`;
  }
  return slug;
};
