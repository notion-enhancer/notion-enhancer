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

Object.assign((globalThis.__enhancerApi ??= {}), {
  sleep,
  debounce,
  setState,
  useState,
  dumpState,
});
