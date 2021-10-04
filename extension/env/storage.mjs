/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * environment-specific data persistence
 * @module notion-enhancer/api/storage
 */

const _queue = [],
  _onChangeListeners = [];

/**
 * get persisted data
 * @param {array<string>} path - the path of keys to the value being fetched
 * @param {*} [fallback] - a default value if the path is not matched
 * @returns {Promise} value ?? fallback
 */
export const get = (path, fallback = undefined) => {
  if (typeof path === 'string') path = [path];
  if (!path.length) return fallback;
  return new Promise((res, rej) =>
    chrome.storage.local.get(async (values) => {
      let value = values;
      while (path.length) {
        if (value === undefined) {
          value = fallback;
          break;
        }
        value = value[path.shift()];
      }
      res(value ?? fallback);
    })
  );
};

/**
 * persist data
 * @param {array<string>} path - the path of keys to the value being set
 * @param {*} value - the data to save
 * @returns {Promise} resolves when data has been saved
 */
export const set = (path, value) => {
  if (typeof path === 'string') path = [path];
  if (!path.length) return undefined;
  const precursor = _queue[_queue.length - 1] || undefined,
    interaction = new Promise(async (res, rej) => {
      if (precursor !== undefined) {
        await precursor;
        _queue.shift();
      }
      const pathClone = [...path],
        namespace = path[0];
      chrome.storage.local.get(async (values) => {
        let pointer = values,
          old;
        while (path.length) {
          const key = path.shift();
          if (!path.length) {
            old = pointer[key];
            pointer[key] = value;
            break;
          }
          pointer[key] = pointer[key] ?? {};
          pointer = pointer[key];
        }
        chrome.storage.local.set({ [namespace]: values[namespace] }, () => {
          _onChangeListeners.forEach((listener) =>
            listener({ type: 'set', path: pathClone, new: value, old })
          );
          res(value);
        });
      });
    });
  _queue.push(interaction);
  return interaction;
};

/**
 * create a wrapper for accessing a partition of the storage
 * @param {array<string>} namespace - the path of keys to prefix all storage requests with
 * @param {function} [get] - the storage get function to be wrapped
 * @param {function} [set] - the storage set function to be wrapped
 * @returns {object} an object with the wrapped get/set functions
 */
export const db = (namespace, getFunc = get, setFunc = set) => {
  if (typeof namespace === 'string') namespace = [namespace];
  return {
    get: (path = [], fallback = undefined) => getFunc([...namespace, ...path], fallback),
    set: (path, value) => setFunc([...namespace, ...path], value),
  };
};

/**
 * add an event listener for changes in storage
 * @param {onStorageChangeCallback} callback - called whenever a change in
 * storage is initiated from the current process
 */
export const addChangeListener = (callback) => {
  _onChangeListeners.push(callback);
};

/**
 * remove a listener added with storage.addChangeListener
 * @param {onStorageChangeCallback} callback
 */
export const removeChangeListener = (callback) => {
  _onChangeListeners = _onChangeListeners.filter((listener) => listener !== callback);
};

/**
 * @callback onStorageChangeCallback
 * @param {object} event
 * @param {string} event.type - 'set' or 'reset'
 * @param {string} event.namespace- the name of the store, e.g. a mod id
 * @param {string} [event.key] - the key associated with the changed value
 * @param {string} [event.new] - the new value being persisted to the store
 * @param {string} [event.old] - the previous value associated with the key
 */
