/**
 * notion-enhancer: components
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/** shared notion-style elements */

import { fs, web } from '../index.mjs';

let $stylesheet, _$tooltip;

const countLines = ($el) =>
    [...$el.getClientRects()].reduce(
      (prev, val) => (prev.some((p) => p.y === val.y) ? prev : [...prev, val]),
      []
    ).length,
  position = ($ref, offsetDirection, maxLines) => {
    _$tooltip.style.top = `0px`;
    _$tooltip.style.left = `0px`;
    const rect = $ref.getBoundingClientRect(),
      { offsetWidth, offsetHeight } = _$tooltip,
      pad = 6;
    let x = rect.x,
      y = Math.floor(rect.y);

    if (['top', 'bottom'].includes(offsetDirection)) {
      if (offsetDirection === 'top') y -= offsetHeight + pad;
      if (offsetDirection === 'bottom') y += rect.height + pad;
      x -= offsetWidth / 2 - rect.width / 2;
      _$tooltip.style.left = `${x}px`;
      _$tooltip.style.top = `${y}px`;
      const testLines = () => countLines(_$tooltip.firstElementChild) > maxLines,
        padEdgesX = testLines();
      while (testLines()) {
        _$tooltip.style.left = `${window.innerWidth - x > x ? x++ : x--}px`;
      }
      if (padEdgesX) {
        x += window.innerWidth - x > x ? pad : -pad;
        _$tooltip.style.left = `${x}px`;
      }
      _$tooltip.style.textAlign = 'center';
    }

    if (['left', 'right'].includes(offsetDirection)) {
      y -= offsetHeight / 2 - rect.height / 2;
      if (offsetDirection === 'left') x -= offsetWidth + pad;
      if (offsetDirection === 'right') x += rect.width + pad;
      _$tooltip.style.left = `${x}px`;
      _$tooltip.style.top = `${y}px`;
      _$tooltip.style.textAlign = 'start';
    }

    return true;
  };

/**
 * add a tooltip to show extra information on hover
 * @param {HTMLElement} $ref - the element that will trigger the tooltip when hovered
 * @param {string|HTMLElement} $content - markdown or element content of the tooltip
 * @param {object=} options - configuration of how the tooltip should be displayed
 * @param {number=} options.delay - the amount of time in ms the element needs to be hovered over
 * for the tooltip to be shown (default: 100)
 * @param {string=} options.offsetDirection - which side of the element the tooltip
 * should be shown on: 'top', 'bottom', 'left' or 'right' (default: 'bottom')
 * @param {number=} options.maxLines - the max number of lines that the content may be wrapped
 * to, used to position and size the tooltip correctly (default: 1)
 */
export const addTooltip = async (
  $ref,
  $content,
  { delay = 100, offsetDirection = 'bottom', maxLines = 1 } = {}
) => {
  if (!$stylesheet) {
    $stylesheet = web.loadStylesheet('api/components/tooltip.css');
    _$tooltip = web.html`<div id="enhancer--tooltip"></div>`;
    web.render(document.body, _$tooltip);
  }

  if (!globalThis.markdownit) await import(fs.localPath('dep/markdown-it.min.js'));
  const md = markdownit({ linkify: true });

  if (!($content instanceof Element))
    $content = web.html`<div style="display:inline">
      ${$content
        .split('\n')
        .map((text) => md.renderInline(text))
        .join('<br>')}
    </div>`;

  let displayDelay;
  $ref.addEventListener('mouseover', (_event) => {
    if (!displayDelay) {
      displayDelay = setTimeout(async () => {
        if ($ref.matches(':hover')) {
          if (_$tooltip.style.display !== 'block') {
            _$tooltip.style.display = 'block';
            web.render(web.empty(_$tooltip), $content);
            position($ref, offsetDirection, maxLines);
            await _$tooltip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 65 })
              .finished;
          }
        }
        displayDelay = undefined;
      }, delay);
    }
  });

  $ref.addEventListener('mouseout', async (_event) => {
    displayDelay = undefined;
    if (_$tooltip.style.display === 'block' && !$ref.matches(':hover')) {
      await _$tooltip.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 65 }).finished;
      _$tooltip.style.display = '';
    }
  });
};
