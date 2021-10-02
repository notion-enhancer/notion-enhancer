/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * notion-style elements inc. the sidebar
 * @module notion-enhancer/api/components/tooltip
 */

import { fmt, web } from '../_.mjs';

let _$tooltip;

/**
 * add a tooltip to show extra information on hover
 * @param {HTMLElement} $ref - the element that will trigger the tooltip when hovered
 * @param {string} text - the markdown content of the tooltip
 */
export const tooltip = ($ref, text) => {
  if (!_$tooltip) {
    web.loadStylesheet('api/components/tooltip.css');
    _$tooltip = web.html`<div id="enhancer--tooltip"></div>`;
    web.render(document.body, _$tooltip);
  }
  text = fmt.md.render(text);
  $ref.addEventListener('mouseover', (event) => {
    _$tooltip.innerHTML = text;
    _$tooltip.style.display = 'block';
  });
  $ref.addEventListener('mousemove', (event) => {
    _$tooltip.style.top = event.clientY - _$tooltip.clientHeight + 'px';
    _$tooltip.style.left = event.clientX - _$tooltip.clientWidth + 'px';
  });
  $ref.addEventListener('mouseout', (event) => {
    _$tooltip.style.display = '';
  });
};
