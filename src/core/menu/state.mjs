/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const _state = {},
  _subscribers = [],
  getState = (keys) => {
    return keys.map((key) => _state[key]);
  },
  setState = (state) => {
    Object.assign(_state, state);
    const updates = Object.keys(state);
    _subscribers
      .filter(([keys]) => updates.some((key) => keys.includes(key)))
      .forEach(([keys, callback]) => callback(keys.map((key) => _state[key])));
  },
  useState = (keys, callback) => {
    _subscribers.push([keys, callback]);
    callback(getState(keys));
  };

export { setState, useState, getState };
