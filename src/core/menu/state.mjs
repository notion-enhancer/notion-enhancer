/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const _state = {},
  _subscribers = [];

const setState = (state) => {
    Object.assign(_state, state);
    const updates = Object.keys(state);
    _subscribers
      .filter(([keys]) => updates.some((key) => keys.includes(key)))
      .forEach(([keys, callback]) => callback(keys.map((key) => _state[key])));
  },
  useState = (keys, callback) => {
    const state = keys.map((key) => _state[key]);
    if (callback) _subscribers.push([keys, callback]);
    callback?.(state);
    return state;
  };

export { setState, useState };
