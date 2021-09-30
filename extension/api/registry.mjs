/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * interactions with the enhancer's repository of mods
 * @module notion-enhancer/api/registry
 */

import * as env from './env.mjs';
import { getJSON } from './fs.mjs';
import * as storage from './storage.mjs';
import { is } from './validation.mjs';

const _cache = [],
  _errors = [];

/** mod ids whitelisted as part of the enhancer's core, permanently enabled */
export const core = [
  'a6621988-551d-495a-97d8-3c568bca2e9e',
  '0f0bf8b6-eae6-4273-b307-8fc43f2ee082',
];

/** all available configuration types */
export const optionTypes = ['toggle', 'select', 'text', 'number', 'color', 'file', 'hotkey'];

/** the name of the active configuration profile */
export const profileName = await storage.get(['currentprofile'], 'default');

/** the root database for the current profile */
export const profileDB = storage.db(['profiles', profileName]);

/**
 * internally used to validate mod.json files and provide helpful errors
 * @private
 * @param {object} mod - a mod's mod.json in object form
 * @returns {boolean} whether or not the mod has passed validation
 */
async function validate(mod) {
  const check = async (
    key,
    value,
    types,
    {
      extension = '',
      error = `invalid ${key} (${extension ? `${extension} ` : ''}${types}): ${JSON.stringify(
        value
      )}`,
      optional = false,
    } = {}
  ) => {
    let test;
    for (const type of types.split('|')) {
      if (type === 'file') {
        test =
          value && !value.startsWith('http')
            ? await is(`repo/${mod._dir}/${value}`, type, { extension })
            : false;
      } else test = await is(value, type, { extension });
      if (test) break;
    }
    if (!test) {
      if (optional && (await is(value, 'undefined'))) return true;
      if (error) _errors.push({ source: mod._dir, message: error });
      return false;
    }
    return true;
  };
  let conditions = [
    check('name', mod.name, 'string'),
    check('id', mod.id, 'uuid'),
    check('version', mod.version, 'semver'),
    check('environments', mod.environments, 'array', { optional: true }).then((passed) => {
      if (!passed) return false;
      if (!mod.environments) {
        mod.environments = env.supported;
        return true;
      }
      return mod.environments.map((tag) => check('environments.env', tag, 'env'));
    }),
    check('description', mod.description, 'string'),
    check('preview', mod.preview, 'file|url', { optional: true }),
    check('tags', mod.tags, 'array').then((passed) => {
      if (!passed) return false;
      const containsCategory = mod.tags.filter((tag) =>
        ['core', 'extension', 'theme'].includes(tag)
      ).length;
      if (!containsCategory) {
        _errors.push({
          source: mod._dir,
          message: `invalid tags (must contain at least one of 'core', 'extension', or 'theme'): ${JSON.stringify(
            mod.tags
          )}`,
        });
        return false;
      }
      return mod.tags.map((tag) => check('tags.tag', tag, 'string'));
    }),
    check('authors', mod.authors, 'array').then((passed) => {
      if (!passed) return false;
      return mod.authors.map((author) => [
        check('authors.author.name', author.name, 'string'),
        check('authors.author.email', author.email, 'email'),
        check('authors.author.homepage', author.homepage, 'url'),
        check('authors.author.avatar', author.avatar, 'url'),
      ]);
    }),
    check('css', mod.css, 'object').then((passed) => {
      if (!passed) return false;
      const tests = [];
      for (let dest of ['frame', 'client', 'menu']) {
        if (!mod.css[dest]) continue;
        let test = check(`css.${dest}`, mod.css[dest], 'array');
        test = test.then((passed) => {
          if (!passed) return false;
          return mod.css[dest].map((file) =>
            check(`css.${dest}.file`, file, 'file', { extension: '.css' })
          );
        });
        tests.push(test);
      }
      return tests;
    }),
    check('js', mod.js, 'object').then((passed) => {
      if (!passed) return false;
      const tests = [];
      if (mod.js.client) {
        let test = check('js.client', mod.js.client, 'array');
        test = test.then((passed) => {
          if (!passed) return false;
          return mod.js.client.map((file) =>
            check('js.client.file', file, 'file', { extension: '.mjs' })
          );
        });
        tests.push(test);
      }
      if (mod.js.electron) {
        let test = check('js.electron', mod.js.electron, 'array');
        test = test.then((passed) => {
          if (!passed) return false;
          return mod.js.electron.map((file) =>
            check('js.electron.file', file, 'object').then((passed) => {
              if (!passed) return false;
              return [
                check('js.electron.file.source', file.source, 'file', {
                  extension: '.mjs',
                }),
                // referencing the file within the electron app
                // existence can't be validated, so only format is
                check('js.electron.file.target', file.target, 'string', {
                  extension: '.js',
                }),
              ];
            })
          );
        });
        tests.push(test);
      }
      return tests;
    }),
    check('options', mod.options, 'array').then((passed) => {
      if (!passed) return false;
      return mod.options.map((option) =>
        check('options.option.type', option.type, 'optionType').then((passed) => {
          if (!passed) return false;
          const tests = [
            check('options.option.key', option.key, 'alphanumeric'),
            check('options.option.label', option.label, 'string'),
            check('options.option.tooltip', option.tooltip, 'string', {
              optional: true,
            }),
            check('options.option.environments', option.environments, 'array', {
              optional: true,
            }).then((passed) => {
              if (!passed) return false;
              if (!option.environments) {
                option.environments = env.supported;
                return true;
              }
              return option.environments.map((env) =>
                check('options.option.environments.env', env, 'env')
              );
            }),
          ];
          switch (option.type) {
            case 'toggle':
              tests.push(check('options.option.value', option.value, 'boolean'));
              break;
            case 'select':
              tests.push(
                check('options.option.values', option.values, 'array').then((passed) => {
                  if (!passed) return false;
                  return option.values.map((value) =>
                    check('options.option.values.value', value, 'string')
                  );
                })
              );
              break;
            case 'text':
            case 'hotkey':
              tests.push(check('options.option.value', option.value, 'string'));
              break;
            case 'number':
            case 'color':
              tests.push(check('options.option.value', option.value, option.type));
              break;
            case 'file':
              tests.push(
                check('options.option.extensions', option.extensions, 'array').then(
                  (passed) => {
                    if (!passed) return false;
                    return option.extensions.map((value) =>
                      check('options.option.extensions.extension', value, 'string')
                    );
                  }
                )
              );
          }
          return tests;
        })
      );
    }),
  ];
  do {
    conditions = await Promise.all(conditions.flat(Infinity));
  } while (conditions.some((condition) => Array.isArray(condition)));
  return conditions.every((passed) => passed);
}

/**
 * list all available mods in the repo
 * @param {function} filter - a function to filter out mods
 * @returns {array} a validated list of mod.json objects
 */
export const list = async (filter = (mod) => true) => {
  if (!_cache.length) {
    for (const dir of await getJSON('repo/registry.json')) {
      try {
        const mod = await getJSON(`repo/${dir}/mod.json`);
        mod._dir = dir;
        if (await validate(mod)) _cache.push(mod);
      } catch {
        _errors.push({ source: dir, message: 'invalid mod.json' });
      }
    }
  }
  const list = [];
  for (const mod of _cache) if (await filter(mod)) list.push(mod);
  return list;
};

/**
 * list validation errors encountered when loading the repo
 * @returns {array<object>} error objects with an error message and a source directory
 */
export const errors = async () => {
  if (!_errors.length) await list();
  return _errors;
};

/**
 * get a single mod from the repo
 * @param {string} id - the uuid of the mod
 * @returns {object} the mod's mod.json
 */
export const get = async (id) => {
  if (!_cache.length) await list();
  return _cache.find((mod) => mod.id === id);
};

/**
 * checks if a mod is enabled: affected by the core whitelist,
 * environment and menu configuration
 * @param {string} id - the uuid of the mod
 * @returns {boolean} whether or not the mod is enabled
 */
export const enabled = async (id) => {
  const mod = await get(id);
  if (!mod.environments.includes(env.name)) return false;
  if (core.includes(id)) return true;
  return await profileDB.get(['_mods', id], false);
};

/**
 * get a default value of a mod's option according to its mod.json
 * @param {string} id - the uuid of the mod
 * @param {string} key - the key of the option
 * @returns {string|number|boolean|undefined} the option's default value
 */
export const optionDefault = async (id, key) => {
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
export const db = async (id) => {
  return storage.db(
    [id],
    async (path, fallback = undefined) => {
      if (path.length === 2) {
        // profiles -> profile -> mod -> option
        fallback = (await optionDefault(id, path[1])) ?? fallback;
      }
      return profileDB.get(path, fallback);
    },
    profileDB.set
  );
};
