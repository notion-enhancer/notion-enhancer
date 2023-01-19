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

const setEnabled = async (id, enabled) => {
    const { getProfile, initDatabase } = globalThis.__enhancerApi;
    // prettier-ignore
    return await initDatabase([
      await getProfile(),
      "enabledMods"
    ]).set(id, enabled);
  },
  modDatabase = async (id) => {
    const { getProfile, initDatabase } = globalThis.__enhancerApi,
      { optionDefaults } = globalThis.__enhancerApi;
    return initDatabase([await getProfile(), id], await optionDefaults(id));
  };

export { setState, useState, getState, setEnabled, modDatabase };
