/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * shared notion-style elements
 * @module notion-enhancer/api/components/feather
 */

import { fs, web } from '../_.mjs';

let _$iconSheet;

/**
 * generate an icon from the feather icons set
 * @param {string} name - the name/id of the icon
 * @param {object} attrs - an object of attributes to apply to the icon e.g. classes
 * @returns {string} an svg string
 */
export const feather = async (name, attrs = {}) => {
  if (!_$iconSheet) {
    _$iconSheet = web.html`${await fs.getText('dep/feather-sprite.svg')}`;
  }
  attrs.style = (
    (attrs.style ? attrs.style + ';' : '') +
    'stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none;'
  ).trim();
  attrs.viewBox = '0 0 24 24';
  return `<svg ${Object.entries(attrs)
    .map(([key, val]) => `${web.escape(key)}="${web.escape(val)}"`)
    .join(' ')}>${_$iconSheet.getElementById(name)?.innerHTML}</svg>`;
};
