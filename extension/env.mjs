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

const focusMenu = () => chrome.runtime.sendMessage({ action: 'focusMenu' }),
  focusNotion = () => chrome.runtime.sendMessage({ action: 'focusNotion' }),
  reload = () => chrome.runtime.sendMessage({ action: 'reload' });

export default {
  name: 'extension',
  version: chrome.runtime.getManifest().version,
  focusMenu,
  focusNotion,
  reload,
};
