/*
 * notion-enhancer core: components
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
 * @param {string|HTMLElement} $text - the markdown content of the tooltip
 * @param {number} [delay] - the amount of time the element needs to be hovered over
 * for the tooltip to be shown
 */
export { setTooltip } from './tooltip.mjs';

/**
 * generate an icon from the feather icons set
 * @param {string} name - the name/id of the icon
 * @param {object} attrs - an object of attributes to apply to the icon e.g. classes
 * @returns {string} an svg string
 */
export { feather } from './feather.mjs';

/**
 * adds a view to the enhancer's side panel
 * @param {object} panel - information used to construct and render the panel
 * @param {string} panel.id - a uuid, used to restore the last open view on reload
 * @param {string} panel.icon - an svg string
 * @param {string} panel.title - the name of the view
 * @param {Element} panel.$content - an element containing the content of the view
 * @param {function} panel.onBlur - runs when the view is selected/focused
 * @param {function} panel.onFocus - runs when the view is unfocused/closed
 */
export { addPanelView } from './panel.mjs';

/**
 * adds a button to notion's bottom right corner
 * @param {string} icon - an svg string
 * @param {function} listener - the function to call when the button is clicked
 * @returns {Element} the appended corner action element
 */
export { addCornerAction } from './corner-action.mjs';
