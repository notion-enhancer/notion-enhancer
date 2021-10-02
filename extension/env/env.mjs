/*
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
export const name = 'extension';

/**
 * the current version of the enhancer
 * @constant
 * @type {string}
 */
export const version = chrome.runtime.getManifest().version;

/**
 * open the enhancer's menu
 * @type {function}
 */
export const focusMenu = () => chrome.runtime.sendMessage({ action: 'focusMenu' });

/**
 * focus an active notion tab
 * @type {function}
 */
export const focusNotion = () => chrome.runtime.sendMessage({ action: 'focusNotion' });

/**
 * reload all notion and enhancer menu tabs to apply changes
 * @type {function}
 */
export const reload = () => chrome.runtime.sendMessage({ action: 'reload' });
