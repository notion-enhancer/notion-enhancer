/**
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * access to electron renderer apis
 * @module notion-enhancer/api/env
 */

/**
 * access to the electron BrowserWindow instance for the current window
 * see https://www.electronjs.org/docs/latest/api/browser-window
 * @type {BrowserWindow}
 *
 * @env win32
 * @env linux
 * @env darwin
 * @runtime client
 * @runtime menu
 */
export const browser = globalThis.__enhancerElectronApi?.browser;

/**
 * access to the electron webFrame instance for the current page
 * see https://www.electronjs.org/docs/latest/api/web-frame
 * @type {webFrame}
 *
 * @env win32
 * @env linux
 * @env darwin
 * @runtime client
 * @runtime menu
 */
export const webFrame = globalThis.__enhancerElectronApi?.webFrame;

/**
 * send a message to the main electron process
 * @param {string} channel - the message identifier
 * @param {any} data - the data to pass along with the message
 * @param {string=} namespace - a prefix for the message to categorise
 * it as e.g. enhancer-related. this should not be changed unless replicating
 * builtin ipc events.
 *
 * @env win32
 * @env linux
 * @env darwin
 * @runtime client
 * @runtime menu
 */
export const sendMessage = (channel, data, namespace = 'notion-enhancer') => {
  if (globalThis.__enhancerElectronApi) {
    globalThis.__enhancerElectronApi.ipcRenderer.sendMessage(channel, data, namespace);
  }
};

/**
 * send a message to the webview's parent renderer process
 * @param {string} channel - the message identifier
 * @param {any} data - the data to pass along with the message
 * @param {string=} namespace - a prefix for the message to categorise
 * it as e.g. enhancer-related. this should not be changed unless replicating
 * builtin ipc events.
 *
 * @env win32
 * @env linux
 * @env darwin
 * @runtime client
 * @runtime menu
 */
export const sendMessageToHost = (channel, data, namespace = 'notion-enhancer') => {
  if (globalThis.__enhancerElectronApi) {
    globalThis.__enhancerElectronApi.ipcRenderer.sendMessageToHost(channel, data, namespace);
  }
};

/**
 * receive a message from either the main process or
 * the webview's parent renderer process
 * @param {string} channel - the message identifier to listen for
 * @param {function} callback - the message handler, passed the args (event, data)
 * @param {string=} namespace - a prefix for the message to categorise
 * it as e.g. enhancer-related. this should not be changed unless replicating
 * builtin ipc events.
 *
 * @env win32
 * @env linux
 * @env darwin
 * @runtime client
 * @runtime menu
 */
export const onMessage = (channel, callback, namespace = 'notion-enhancer') => {
  if (globalThis.__enhancerElectronApi) {
    globalThis.__enhancerElectronApi.ipcRenderer.onMessage(channel, callback, namespace);
  }
};
