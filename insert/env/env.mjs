/**
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * environment-specific methods and constants
 * @module notion-enhancer/api/env
 */

/**
 * the environment/platform name code is currently being executed in
 * @constant
 * @type {string}
 */
export const name = globalThis.__enhancerElectronApi.platform;

/**
 * the current version of the enhancer
 * @constant
 * @type {string}
 */
export const version = globalThis.__enhancerElectronApi.version;

/**
 * open the enhancer's menu
 * @type {function}
 */
export const focusMenu = globalThis.__enhancerElectronApi.focusMenu;

/**
 * focus an active notion tab
 * @type {function}
 */
export const focusNotion = globalThis.__enhancerElectronApi.focusNotion;

/**
 * reload all notion and enhancer menu tabs to apply changes
 * @type {function}
 */
export const reload = globalThis.__enhancerElectronApi.reload;

/**
 * require() notion app files
 * @param {string} path - within notion/resources/app e.g. main/createWindow.js
 */
export const notionRequire = globalThis.__enhancerElectronApi.notionRequire;
