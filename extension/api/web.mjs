/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * helpers for manipulation of a webpage
 * @module notion-enhancer/api/web
 */

import { fs, fmt } from './_.mjs';

import '../dep/jscolor.min.js';
/** color picker with alpha channel using https://jscolor.com/ */
export const jscolor = JSColor;

/**
 * wait until a page is loaded and ready for modification
 * @param {array} [selectors=[]] - wait for the existence of elements that match these css selectors
 * @returns {Promise} a promise that will resolve when the page is ready
 */
export const whenReady = (selectors = []) => {
  return new Promise((res, rej) => {
    function onLoad() {
      let isReadyInt;
      isReadyInt = setInterval(isReadyTest, 100);
      function isReadyTest() {
        if (selectors.every((selector) => document.querySelector(selector))) {
          clearInterval(isReadyInt);
          res(true);
        }
      }
      isReadyTest();
    }
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState === 'complete') onLoad();
      });
    } else onLoad();
  });
};

/**
 * parse the current location search params into a usable form
 * @returns {map<string,string>} a map of the url search params
 */
export const queryParams = () => new URLSearchParams(window.location.search);

/**
 * replace special html characters with escaped versions
 * @param {string} str
 * @returns {string} escaped string
 */
export const escape = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/\\/g, '&#x5C;');

/**
 * a tagged template processor for raw html:
 * stringifies, minifies, and syntax highlights
 * @example web.raw`<p>hello</p>`
 * @returns {string} the processed html
 */
export const raw = (str, ...templates) => {
  const html = str
    .map(
      (chunk) =>
        chunk +
        (['string', 'number'].includes(typeof templates[0])
          ? templates.shift()
          : escape(JSON.stringify(templates.shift(), null, 2) ?? ''))
    )
    .join('');
  return html.includes('<pre')
    ? html.trim()
    : html
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => line.length)
        .join(' ');
};

/**
 * create a single html element inc. attributes and children from a string
 * @example web.html`<p>hello</p>`
 * @returns {Element} the constructed html element
 */
export const html = (str, ...templates) => {
  const $fragment = document.createRange().createContextualFragment(raw(str, ...templates));
  return $fragment.children.length === 1 ? $fragment.children[0] : $fragment.children;
};

/**
 * appends a list of html elements to a parent
 * @param $container - the parent element
 * @param $elems - the elements to be appended
 * @returns {Element} the updated $container
 */
export const render = ($container, ...$elems) => {
  $elems = $elems
    .map(($elem) => ($elem instanceof HTMLCollection ? [...$elem] : $elem))
    .flat(Infinity)
    .filter(($elem) => $elem);
  $container.append(...$elems);
  return $container;
};

/**
 * removes all children from an element without deleting them/their behaviours
 * @param $container - the parent element
 * @returns {Element} the updated $container
 */
export const empty = ($container) => {
  while ($container.firstChild && $container.removeChild($container.firstChild));
  return $container;
};

/**
 * loads/applies a css stylesheet to the page
 * @param {string} path - a url or within-the-enhancer filepath
 */
export const loadStylesheet = (path) => {
  render(
    document.head,
    html`<link
      rel="stylesheet"
      href="${path.startsWith('https://') ? path : fs.localPath(path)}"
    />`
  );
  return true;
};

const _hotkeyEvent = document.addEventListener('keyup', (event) => {
    if (document.activeElement.nodeName === 'INPUT') return;
    for (const hotkey of _hotkeyEventListeners) {
      const pressed = hotkey.keys.every((key) => {
        key = key.toLowerCase();
        const modifiers = {
          metaKey: ['meta', 'os', 'win', 'cmd', 'command'],
          ctrlKey: ['ctrl', 'control'],
          shiftKey: ['shift'],
          altKey: ['alt'],
        };
        for (const modifier in modifiers) {
          const pressed = modifiers[modifier].includes(key) && event[modifier];
          if (pressed) return true;
        }
        if (key === event.key.toLowerCase()) return true;
      });
      if (pressed) hotkey.callback();
    }
  }),
  _hotkeyEventListeners = [];

/**
 * register a hotkey listener to the page
 * @param {array} keys - the combination of keys that will trigger the hotkey.
 * key codes can be tested at http://keycode.info/ and are case-insensitive.
 * available modifiers are 'alt', 'ctrl', 'meta', and 'shift'.
 * @param {function} callback - called whenever the keys are pressed
 */
export const addHotkeyListener = (keys, callback) => {
  if (typeof keys === 'string') keys = keys.split('+');
  _hotkeyEventListeners.push({ keys, callback });
};
/**
 * remove a listener added with web.addHotkeyListener
 * @param {function} callback
 */
export const removeHotkeyListener = (callback) => {
  _hotkeyEventListeners = _hotkeyEventListeners.filter(
    (listener) => listener.callback !== callback
  );
};

const _documentObserver = new MutationObserver((list, observer) => {
    if (!_documentObserverEvents.length)
      requestIdleCallback(() => (queue) => {
        while (queue.length) {
          const event = queue.shift();
          for (const listener of _documentObserverListeners) {
            if (
              !listener.selectors.length ||
              listener.selectors.some(
                (selector) =>
                  event.target.matches(selector) || event.target.matches(`${selector} *`)
              )
            ) {
              listener.callback(event);
            }
          }
        }
      });
    _documentObserverEvents.push(...list);
  }),
  _documentObserverListeners = [],
  _documentObserverEvents = [];
_documentObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
});
/**
 * add a listener to watch for changes to the dom
 * @param {onDocumentObservedCallback} callback
 * @param {array<string>} [selectors]
 */
export const addDocumentObserver = (callback, selectors = []) => {
  _documentObserverListeners.push({ callback, selectors });
};

/**
 * remove a listener added with web.addDocumentObserver
 * @param {onDocumentObservedCallback} callback
 */
export const removeDocumentObserver = (callback) => {
  _documentObserverListeners = _documentObserverListeners.filter(
    (listener) => listener.callback !== callback
  );
};

/**
 * @callback onDocumentObservedCallback
 * @param {MutationRecord} event - the observed dom mutation event
 */
