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
 *
 * @env win32
 * @env linux
 * @env darwin
 * @runtime client
 * @runtime menu
 */
export const sendMessage = globalThis.__enhancerElectronApi?.ipcRenderer?.sendMessage;

/**
 * send a message to the webview's parent renderer process
 * @param {string} channel - the message identifier
 * @param {any} data - the data to pass along with the message
 *
 * @env win32
 * @env linux
 * @env darwin
 * @runtime client
 * @runtime menu
 */
export const sendMessageToHost =
  globalThis.__enhancerElectronApi?.ipcRenderer?.sendMessageToHost;

/**
 * receive a message from either the main process or
 * the webview's parent renderer process
 * @param {string} channel - the message identifier to listen for
 * @param {function} listener - the message handler, passed the args (event, data)
 *
 * @env win32
 * @env linux
 * @env darwin
 * @runtime client
 * @runtime menu
 */
export const onMessage = globalThis.__enhancerElectronApi?.ipcRenderer?.onMessage;
