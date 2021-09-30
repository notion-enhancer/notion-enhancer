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
 * @constant {string}
 */
export const name = 'chrome';

/**
 * all environments/platforms currently supported by the enhancer
 * @constant {array<string>}
 */
export const supported = ['linux', 'win32', 'darwin', 'chrome', 'firefox'];

/**
 * the current version of the enhancer
 * @constant {string}
 */
export const version = chrome.runtime.getManifest().version;

/** open the enhancer's menu */
export const focusMenu = () => chrome.runtime.sendMessage({ action: 'focusMenu' });

/** focus an active notion tab */
export const focusNotion = () => chrome.runtime.sendMessage({ action: 'focusNotion' });

/** reload all notion and enhancer menu tabs to apply changes */
export const reload = () => chrome.runtime.sendMessage({ action: 'reload' });

/** a notification displayed when the menu is opened for the first time */
export const welcomeNotification = {
  id: '84e2d49b-c3dc-44b4-a154-cf589676bfa0',
  color: 'purple',
  icon: 'message-circle',
  message: 'Welcome! Come chat with us on Discord.',
  link: 'https://discord.gg/sFWPXtA',
  version,
};
