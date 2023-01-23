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

const extendProps = (props, extend) => {
  for (const key in extend) {
    const { [key]: userProvided } = props;
    if (typeof extend[key] === "function") {
      props[key] = (...args) => {
        extend[key](...args);
        userProvided?.(...args);
      };
    } else if (key === "class") {
      if (userProvided) props[key] += " ";
      if (!userProvided) props[key] = "";
      props[key] += extend[key];
    } else props[key] = extend[key] ?? userProvided;
  }
  return props;
};

export { setState, useState, extendProps };
