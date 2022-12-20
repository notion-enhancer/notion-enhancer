/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

let mutationListeners = [];
const documentMutations = [],
  selectorMutated = (mutation, selector) =>
    mutation.target?.matches(`${selector}, ${selector} *`) ||
    [...(mutation.addedNodes || [])].some(
      (node) =>
        node instanceof HTMLElement &&
        (node?.matches(`${selector}, ${selector} *`) ||
          node?.querySelector(selector))
    ),
  handleMutations = () => {
    while (documentMutations.length) {
      const mutation = documentMutations.shift();
      for (const [selector, callback] of mutationListeners) {
        if (selectorMutated(mutation, selector)) callback(mutation);
      }
    }
  };
const documentObserver = new MutationObserver((mutations, _observer) => {
    if (!documentMutations.length) requestIdleCallback(handleMutations);
    documentMutations.push(...mutations);
  }),
  attachObserver = () => {
    if (document.readyState !== "complete") return;
    documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };
document.addEventListener("readystatechange", attachObserver);
attachObserver();

const addMutationListener = (selector, callback) => {
    mutationListeners.push([selector, callback]);
  },
  removeMutationListener = (callback) => {
    mutationListeners = mutationListeners.filter(([, c]) => c !== callback);
  };

export { addMutationListener, removeMutationListener };

// let _hotkeyListenersActivated = false,
//   _hotkeyEventListeners = [],
//   _documentObserver,
//   _documentObserverListeners = [];
// const _documentObserverEvents = [];

// /**
//  * wait until a page is loaded and ready for modification
//  * @param {array=} selectors - wait for the existence of elements that match these css selectors
//  * @returns {Promise} a promise that will resolve when the page is ready
//  */
// export const whenReady = (selectors = []) => {
//   return new Promise((res, _rej) => {
//     const onLoad = () => {
//       const interval = setInterval(isReady, 100);
//       function isReady() {
//         const ready = selectors.every((selector) => document.querySelector(selector));
//         if (!ready) return;
//         clearInterval(interval);
//         res(true);
//       }
//       isReady();
//     };
//     if (document.readyState !== "complete") {
//       document.addEventListener("readystatechange", (_event) => {
//         if (document.readyState === "complete") onLoad();
//       });
//     } else onLoad();
//   });
// };

// const triggerHotkeyListener = (event, hotkey) => {
//   const inInput = document.activeElement.nodeName === "INPUT" && !hotkey.listenInInput;
//   if (inInput) return;
//   const modifiers = {
//       metaKey: ["meta", "os", "win", "cmd", "command"],
//       ctrlKey: ["ctrl", "control"],
//       shiftKey: ["shift"],
//       altKey: ["alt"],
//     },
//     pressed = hotkey.keys.every((key) => {
//       key = key.toLowerCase();
//       for (const modifier in modifiers) {
//         const pressed = modifiers[modifier].includes(key) && event[modifier];
//         if (pressed) {
//           // mark modifier as part of hotkey
//           modifiers[modifier] = [];
//           return true;
//         }
//       }
//       if (key === "space") key = " ";
//       if (key === "plus") key = "+";
//       if (key === event.key.toLowerCase()) return true;
//     });
//   if (!pressed) return;
//   // test for modifiers not in hotkey
//   // e.g. to differentiate ctrl+x from ctrl+shift+x
//   for (const modifier in modifiers) {
//     const modifierPressed = event[modifier],
//       modifierNotInHotkey = modifiers[modifier].length > 0;
//     if (modifierPressed && modifierNotInHotkey) return;
//   }
//   hotkey.callback(event);
// };

// /**
//  * register a hotkey listener to the page
//  * @param {array|string} keys - the combination of keys that will trigger the hotkey.
//  * key codes can be tested at http://keycode.info/ and are case-insensitive.
//  * available modifiers are 'alt', 'ctrl', 'meta', and 'shift'.
//  * can be provided as a + separated string.
//  * @param {function} callback - called whenever the keys are pressed
//  * @param {object=} opts - fine-tuned control over when the hotkey should be triggered
//  * @param {boolean=} opts.listenInInput - whether the hotkey callback should be triggered
//  * when an input is focused
//  * @param {boolean=} opts.keydown - whether to listen for the hotkey on keydown.
//  * by default, hotkeys are triggered by the keyup event.
//  */
// export const addHotkeyListener = (
//   keys,
//   callback,
//   { listenInInput = false, keydown = false } = {}
// ) => {
//   if (typeof keys === "string") keys = keys.split("+");
//   _hotkeyEventListeners.push({ keys, callback, listenInInput, keydown });

//   if (!_hotkeyListenersActivated) {
//     _hotkeyListenersActivated = true;
//     document.addEventListener("keyup", (event) => {
//       for (const hotkey of _hotkeyEventListeners.filter(({ keydown }) => !keydown)) {
//         triggerHotkeyListener(event, hotkey);
//       }
//     });
//     document.addEventListener("keydown", (event) => {
//       for (const hotkey of _hotkeyEventListeners.filter(({ keydown }) => keydown)) {
//         triggerHotkeyListener(event, hotkey);
//       }
//     });
//   }
// };
// /**
//  * remove a listener added with web.addHotkeyListener
//  * @param {function} callback
//  */
// export const removeHotkeyListener = (callback) => {
//   _hotkeyEventListeners = _hotkeyEventListeners.filter(
//     (listener) => listener.callback !== callback
//   );
// };
