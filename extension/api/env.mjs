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

import env from '../env.mjs';

/**
 * the environment/platform name code is currently being executed in
 * @constant
 * @type {string}
 */
export const name = env.name;

/**
 * the current version of the enhancer
 * @constant
 * @type {string}
 */
export const version = env.version;

/**
 * open the enhancer's menu
 * @type {function}
 */
export const focusMenu = env.focusMenu;

/**
 * focus an active notion tab
 * @type {function}
 */
export const focusNotion = env.focusNotion;

/**
 * reload all notion and enhancer menu tabs to apply changes
 * @type {function}
 */
export const reload = env.reload;
