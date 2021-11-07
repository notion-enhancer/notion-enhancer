/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * environment-specific methods and constants
 * @module notion-enhancer/api/env
 */

module.exports = {};

/**
 * the environment/platform name code is currently being executed in
 * @constant
 * @type {string}
 */
module.exports.name = process.platform;

/**
 * the current version of the enhancer
 * @constant
 * @type {string}
 */
module.exports.version = require('notion-enhancer/package.json').version;

/**
 * open the enhancer's menu
 * @type {function}
 */
module.exports.focusMenu = () => console.log(1);
//  window.__enhancerElectronApi.sendMessage({ action: 'focusMenu' });

/**
 * focus an active notion tab
 * @type {function}
 */
module.exports.focusNotion = () => console.log(1);
//  window.__enhancerElectronApi.sendMessage({ action: 'focusNotion' });

/**
 * reload all notion and enhancer menu tabs to apply changes
 * @type {function}
 */
module.exports.reload = () => console.log(1); // window.__enhancerElectronApi.sendMessage({ action: 'reload' });
