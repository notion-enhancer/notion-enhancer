/**
 * notion-enhancer: components
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
 * @param {string|HTMLElement} $content - markdown or element content of the tooltip
 * @param {object=} [options] - configuration of how the tooltip should be displayed
 * @param {number} [options.delay] - the amount of time in ms the element needs to be hovered over
 * for the tooltip to be shown (default: 100)
 * @param {string} [options.offsetDirection] - which side of the element the tooltip
 * should be shown on: 'top', 'bottom', 'left' or 'right' (default: 'bottom')
 * @param {number} [options.maxLines] - the max number of lines that the content may be wrapped
 * to, used to position and size the tooltip correctly (default: 1)
 */
export { addTooltip } from './tooltip.mjs';

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
