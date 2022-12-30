/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

let documentObserver,
  mutationListeners = [];
const mutationQueue = [],
  addMutationListener = (selector, callback) => {
    mutationListeners.push([selector, callback]);
  },
  removeMutationListener = (callback) => {
    mutationListeners = mutationListeners.filter(([, c]) => c !== callback);
  },
  onSelectorMutated = (mutation, selector) =>
    mutation.target?.matches(`${selector}, ${selector} *`) ||
    [...(mutation.addedNodes || [])].some(
      (node) =>
        node instanceof HTMLElement &&
        (node?.matches(`${selector}, ${selector} *`) ||
          node?.querySelector(selector))
    ),
  handleMutations = () => {
    while (mutationQueue.length) {
      const mutation = mutationQueue.shift();
      for (const [selector, callback] of mutationListeners) {
        if (onSelectorMutated(mutation, selector)) callback(mutation);
      }
    }
  },
  attachObserver = () => {
    if (document.readyState !== "complete") return;
    documentObserver ??= new MutationObserver((mutations, _observer) => {
      if (!mutationQueue.length) requestIdleCallback(handleMutations);
      mutationQueue.push(...mutations);
    });
    documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };
document.addEventListener("readystatechange", attachObserver);
attachObserver();

let keyListeners = [];
// accelerators approximately match electron accelerators.
// logic used when recording hotkeys in menu matches logic used
// when triggering hotkeys ∴ detection should be reliable.
// default hotkeys using "alt" may trigger an altcode or
// accented character on some keyboard layouts (not recommended).
const modifierAliases = [
    ["metaKey", ["meta", "os", "win", "cmd", "command"]],
    ["ctrlKey", ["ctrl", "control"]],
    ["shiftKey", ["shift"]],
    ["altKey", ["alt"]],
  ],
  addKeyListener = (accelerator, callback, waitForKeyup = false) => {
    if (typeof accelerator === "string") accelerator = accelerator.split("+");
    accelerator = accelerator.map((key) => key.toLowerCase());
    keyListeners.push([accelerator, callback, waitForKeyup]);
  },
  removeKeyListener = (callback) => {
    keyListeners = keyListeners.filter(([, c]) => c !== callback);
  },
  handleKeypress = (event, keyListeners) => {
    for (const [accelerator, callback] of keyListeners) {
      const acceleratorModifiers = [],
        combinationTriggered =
          accelerator.every((key) => {
            for (const [modifier, aliases] of modifierAliases) {
              if (aliases.includes(key)) {
                acceleratorModifiers.push(modifier);
                return true;
              }
            }
            if (key === "plus") key = "+";
            const keyPressed = [
              event.key.toLowerCase(),
              event.code.toLowerCase(),
            ].includes(key);
            return keyPressed;
          }) &&
          modifierAliases.every(([modifier]) => {
            // required && used -> matches accelerator
            // !required && !used -> matches accelerator
            // (required && !used) || (!required && used) -> no match
            // differentiates e.g.ctrl + x from ctrl + shift + x
            return acceleratorModifiers.includes(modifier) === event[modifier];
          });
      if (combinationTriggered) callback(event);
    }
  };
document.addEventListener("keyup", (event) => {
  const keyupListeners = keyListeners.filter(
    ([, , waitForKeyup]) => waitForKeyup
  );
  handleKeypress(event, keyupListeners);
});
document.addEventListener("keydown", (event) => {
  const keydownListeners = keyListeners.filter(
    ([, , waitForKeyup]) => !waitForKeyup
  );
  handleKeypress(event, keydownListeners);
});

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  addMutationListener,
  removeMutationListener,
  addKeyListener,
  removeKeyListener,
});
