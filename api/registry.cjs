/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * interactions with the enhancer's repository of mods
 * @module notion-enhancer/api/registry
 */

/**
 * mod ids whitelisted as part of the enhancer's core, permanently enabled
 * @constant
 * @type {array<string>}
 */
module.exports.core = [
  'a6621988-551d-495a-97d8-3c568bca2e9e',
  '0f0bf8b6-eae6-4273-b307-8fc43f2ee082',
  '36a2ffc9-27ff-480e-84a7-c7700a7d232d',
];

/**
 * all environments/platforms currently supported by the enhancer
 * @constant
 * @type {array<string>}
 */
module.exports.supportedEnvs = ['linux', 'win32', 'darwin', 'extension'];

/**
 * all available configuration types
 * @constant
 * @type {array<string>}
 */
module.exports.optionTypes = ['toggle', 'select', 'text', 'number', 'color', 'file', 'hotkey'];

/**
 * the name of the active configuration profile
 * @returns {string}
 */
module.exports.profileName = async () => {
  const storage = require('notion-enhancer/api/storage.cjs');
  return storage.get(['currentprofile'], 'default');
};

/**
 * the root database for the current profile
 * @returns {object} the get/set functions for the profile's storage
 */
module.exports.profileDB = async () => {
  const storage = require('notion-enhancer/api/storage.cjs');
  return storage.db(['profiles', await module.exports.profileName()]);
};

let _list,
  _errors = [];
/**
 * list all available mods in the repo
 * @param {function} filter - a function to filter out mods
 * @returns {array} a validated list of mod.json objects
 */
module.exports.list = async (filter = (mod) => true) => {
  if (!_list) {
    const { validate } = require('notion-enhancer/api/registry-validation.cjs'),
      { getJSON } = require('notion-enhancer/api/fs.cjs');
    _list = new Promise(async (res, rej) => {
      const passed = [];
      for (const dir of await getJSON('repo/registry.json')) {
        try {
          const mod = {
            ...(await getJSON(`repo/${dir}/mod.json`)),
            _dir: dir,
            _err: (message) => _errors.push({ source: dir, message }),
          };
          if (await validate(mod)) passed.push(mod);
        } catch {
          _errors.push({ source: dir, message: 'invalid mod.json' });
        }
      }
      res(passed);
    });
  }
  const filtered = [];
  for (const mod of await _list) if (await filter(mod)) filtered.push(mod);
  return filtered;
};

/**
 * list validation errors encountered when loading the repo
 * @returns {array<object>} error objects with an error message and a source directory
 */
module.exports.errors = async () => {
  await module.exports.list();
  return _errors;
};

/**
 * get a single mod from the repo
 * @param {string} id - the uuid of the mod
 * @returns {object} the mod's mod.json
 */
module.exports.get = async (id) => {
  return (await module.exports.list((mod) => mod.id === id))[0];
};

/**
 * checks if a mod is enabled: affected by the core whitelist,
 * environment and menu configuration
 * @param {string} id - the uuid of the mod
 * @returns {boolean} whether or not the mod is enabled
 */
module.exports.enabled = async (id) => {
  const env = require('notion-enhancer/api/env.cjs'),
    mod = await module.exports.get(id);
  if (!mod.environments.includes(env.name)) return false;
  if (module.exports.core.includes(id)) return true;
  return (await module.exports.profileDB()).get(['_mods', id], false);
};

/**
 * get a default value of a mod's option according to its mod.json
 * @param {string} id - the uuid of the mod
 * @param {string} key - the key of the option
 * @returns {string|number|boolean|undefined} the option's default value
 */
module.exports.optionDefault = async (id, key) => {
  const mod = await get(id),
    opt = mod.options.find((opt) => opt.key === key);
  if (!opt) return undefined;
  switch (opt.type) {
    case 'toggle':
    case 'text':
    case 'number':
    case 'color':
    case 'hotkey':
      return opt.value;
    case 'select':
      return opt.values[0];
    case 'file':
      return undefined;
  }
};

/**
 * access the storage partition of a mod in the current profile
 * @param {string} id - the uuid of the mod
 * @returns {object} an object with the wrapped get/set functions
 */
module.exports.db = async (id) => {
  const storage = require('notion-enhancer/api/storage.cjs'),
    db = await module.exports.profileDB();
  return storage.db(
    [id],
    async (path, fallback = undefined) => {
      if (typeof path === 'string') path = [path];
      if (path.length === 2) {
        // profiles -> profile -> mod -> option
        fallback = (await module.exports.optionDefault(id, path[1])) ?? fallback;
      }
      return db.get(path, fallback);
    },
    db.set
  );
};
