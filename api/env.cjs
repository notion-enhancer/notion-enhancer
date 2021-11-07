/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';
module.exports = {};

/**
 * environment-specific methods and constants
 * @module notion-enhancer/api/env
 */

const env = require('../env/env.cjs');

/**
 * the environment/platform name code is currently being executed in
 * @constant
 * @type {string}
 */
module.exports.name = env.name;

/**
 * the current version of the enhancer
 * @constant
 * @type {string}
 */
module.exports.version = env.version;

/**
 * open the enhancer's menu
 * @type {function}
 */
module.exports.focusMenu = env.focusMenu;

/**
 * focus an active notion tab
 * @type {function}
 */
module.exports.focusNotion = env.focusNotion;

/**
 * reload all notion and enhancer menu tabs to apply changes
 * @type {function}
 */
module.exports.reload = env.reload;

/**
 * require() notion app files
 * @param {string} path - path from the root of notion/resources/app/ e.g. main/createWindow.js
 */
module.exports.notionRequire = env.notionRequire;
