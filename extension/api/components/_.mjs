/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * shared notion-style elements
 * @module notion-enhancer/api/components
 */

/**
 * add a tooltip to show extra information on hover
 * @param {HTMLElement} $ref - the element that will trigger the tooltip when hovered
 * @param {string} text - the markdown content of the tooltip
 */
export { tooltip } from './tooltip.mjs';

/**
 * generate an icon from the feather icons set
 * @param {string} name - the name/id of the icon
 * @param {object} attrs - an object of attributes to apply to the icon e.g. classes
 * @returns {string} an svg string
 */
export { feather } from './feather.mjs';

export { panel } from './panel.mjs';
