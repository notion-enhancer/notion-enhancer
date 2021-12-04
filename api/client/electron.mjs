/*
 * notion-enhancer core: api
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
 */
export const browser = window.__enhancerElectronApi?.browser;

/**
 * access to the electron webFrame instance for the current page
 * see https://www.electronjs.org/docs/latest/api/web-frame
 * @type {webFrame}
 */
export const webFrame = window.__enhancerElectronApi?.webFrame;

/**
 * send a message to the main electron process
 * @param {string} channel - the message identifier
 * @param {any} data - the data to pass along with the message
 */
export const sendMessage = window.__enhancerElectronApi?.sendMessage;

/**
 * send a message to the webview's parent renderer process
 * @param {string} channel - the message identifier
 * @param {any} data - the data to pass along with the message
 */
export const sendMessageToHost = window.__enhancerElectronApi?.sendMessageToHost;

/**
 * receive a message from either the main process or
 * the webview's parent renderer process
 * @param {string} channel - the message identifier to listen for
 * @param {function} listener - the message handler, passed the args (event, data)
 */
export const onMessage = window.__enhancerElectronApi?.onMessage;
