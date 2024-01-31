/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

// batch event callbacks to avoid over-handling
// and any conflicts / perf.issues that may
// otherwise result. initial call is immediate,
// following calls are delayed. a wait time of
// ~200ms is recommended (the avg. human visual
// reaction time is ~180-200ms)
const sleep = async (ms) => {
    return new Promise((res, rej) => setTimeout(res, ms));
  },
  debounce = (callback, ms = 200) => {
    let delay, update;
    const next = () =>
      sleep(ms).then(() => {
        if (!update) return (delay = undefined);
        update(), (update = undefined);
        delay = next();
      });
    return (...args) => {
      if (delay) update = callback.bind(this, ...args);
      return delay || ((delay = next()), callback(...args));
    };
  };

// provides basic key/value reactivity:
// this is shared between all active mods,
// i.e. mods can read and update other mods'
// reactive states. this enables interop
// between a mod's component islands and
// supports inter-mod communication if so
// required. caution should be used in
// naming keys to avoid conflicts
const _state = {},
  _subscribers = [],
  setState = (state) => {
    Object.assign(_state, state);
    const updates = Object.keys(state);
    _subscribers
      .filter(([keys]) => updates.some((key) => keys.includes(key)))
      .forEach(([keys, callback]) => callback(keys.map((key) => _state[key])));
  },
  // useState(["keyA", "keyB"]) => returns [valueA, valueB]
  // useState(["keyA", "keyB"], callback) => registers callback
  // to be triggered after each update to either keyA or keyB,
  // with [valueA, valueB] passed to the callback's first arg
  useState = (keys, callback) => {
    const state = keys.map((key) => _state[key]);
    if (callback) {
      callback = debounce(callback);
      _subscribers.push([keys, callback]);
      callback(state);
    }
    return state;
  },
  dumpState = () => _state;

let documentObserver,
  mutationListeners = [];
const mutationQueue = [],
  addMutationListener = (selector, callback, subtree = true) => {
    mutationListeners.push([selector, callback, subtree]);
  },
  removeMutationListener = (callback) => {
    mutationListeners = mutationListeners.filter(([, c]) => c !== callback);
  },
  selectorMutated = (mutation, selector, subtree) => {
    const target =
        mutation.type === "characterData"
          ? mutation.target.parentElement
          : mutation.target,
      matchesTarget = target?.matches(selector);
    if (!subtree) return matchesTarget;
    const descendsFromTarget = target?.matches(`${selector} *`),
      addedToTarget = [...(mutation.addedNodes || [])].some(
        (node) =>
          node instanceof HTMLElement &&
          (node?.matches(`${selector}, ${selector} *`) ||
            node?.querySelector(selector))
      );
    return matchesTarget || descendsFromTarget || addedToTarget;
  },
  handleMutations = () => {
    while (mutationQueue.length) {
      const mutation = mutationQueue.shift();
      for (const [selector, callback, subtree] of mutationListeners) {
        const matches = selectorMutated(mutation, selector, subtree);
        if (matches) callback(mutation);
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
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
  };
document.addEventListener("readystatechange", attachObserver);
attachObserver();

let keyListeners = [];
// accelerators approximately match electron accelerators.
// logic used when recording hotkeys in menu matches logic used
// when triggering hotkeys => detection should be reliable.
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
            if (key === "space") key = " ";
            if (key === "plus") key = "equal";
            if (key === "minus") key = "-";
            if (key === "\\") key = "backslash";
            if (key === ",") key = "comma";
            if (key === ".") key = "period";
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
  const keyupListeners = keyListeners //
    .filter(([, , waitForKeyup]) => waitForKeyup);
  handleKeypress(event, keyupListeners);
});
document.addEventListener("keydown", (event) => {
  const keydownListeners = keyListeners //
    .filter(([, , waitForKeyup]) => !waitForKeyup);
  handleKeypress(event, keydownListeners);
});

Object.assign((globalThis.__enhancerApi ??= {}), {
  sleep,
  debounce,
  setState,
  useState,
  dumpState,
  addMutationListener,
  removeMutationListener,
  addKeyListener,
  removeKeyListener,
});
