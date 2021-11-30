/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * shared notion-style elements
 * @module notion-enhancer/api/components/tooltip
 */

import { fmt, web } from '../../index.mjs';

const _$tooltip = web.html`<div id="enhancer--tooltip"></div>`;
web.loadStylesheet('api/components/tooltip.css');

/**
 * add a tooltip to show extra information on hover
 * @param {HTMLElement} $ref - the element that will trigger the tooltip when hovered
 * @param {string|HTMLElement} $text - the markdown content of the tooltip
 * @param {number} [delay] - the amount of time the element needs to be hovered over
 * for the tooltip to be shown
 */
export const setTooltip = ($ref, $text, delay = 100) => {
  web.render(document.body, _$tooltip);
  if (!($text instanceof Element)) $text = web.html`${fmt.md.render($text)}`;
  let displayDelay;
  $ref.addEventListener('mouseover', (event) => {
    web.render(web.empty(_$tooltip), $text);
    if (!displayDelay) {
      displayDelay = setTimeout(async () => {
        if ($ref.matches(':hover')) {
          _$tooltip.style.display = 'block';
          _$tooltip.style.top = event.clientY - _$tooltip.clientHeight + 'px';
          _$tooltip.style.left = event.clientX - _$tooltip.clientWidth + 'px';
          await _$tooltip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 65 }).finished;
        }
        displayDelay = undefined;
      }, delay);
    }
  });
  $ref.addEventListener('mousemove', (event) => {
    _$tooltip.style.top = event.clientY - _$tooltip.clientHeight + 'px';
    _$tooltip.style.left = event.clientX - _$tooltip.clientWidth + 'px';
  });
  $ref.addEventListener('mouseout', async (event) => {
    if (!$ref.matches(':hover')) {
      await _$tooltip.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 65 }).finished;
      _$tooltip.style.display = '';
    }
  });
};
