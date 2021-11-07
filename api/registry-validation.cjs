/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const check = async (
  mod,
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
  const { is } = require('notion-enhancer/api/fmt.cjs');
  let test;
  for (const type of Array.isArray(types) ? [types] : types.split('|')) {
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
    if (error) mod._err(error);
    return false;
  }
  return true;
};

const validateEnvironments = async (mod) => {
    const { supportedEnvs } = require('notion-enhancer/api/registry.cjs');
    mod.environments = mod.environments ?? supportedEnvs;
    const isArray = await check(mod, 'environments', mod.environments, 'array');
    if (!isArray) return false;
    return mod.environments.map((tag) => check(mod, 'environments.env', tag, supportedEnvs));
  },
  validateTags = async (mod) => {
    const isArray = await check(mod, 'tags', mod.tags, 'array');
    if (!isArray) return false;
    const categoryTags = ['core', 'extension', 'theme', 'integration'],
      containsCategory = mod.tags.filter((tag) => categoryTags.includes(tag)).length;
    if (!containsCategory) {
      mod._err(
        `invalid tags (must contain at least one of 'core', 'extension', 'theme' or 'integration'):
        ${JSON.stringify(mod.tags)}`
      );
      return false;
    }
    const isTheme = mod.tags.includes('theme'),
      hasThemeMode = mod.tags.includes('light') || mod.tags.includes('dark'),
      isBothThemeModes = mod.tags.includes('light') && mod.tags.includes('dark');
    if (isTheme && (!hasThemeMode || isBothThemeModes)) {
      mod._err(
        `invalid tags (themes must be either 'light' or 'dark', not neither or both):
        ${JSON.stringify(mod.tags)}`
      );
      return false;
    }
    return mod.tags.map((tag) => check(mod, 'tags.tag', tag, 'string'));
  },
  validateAuthors = async (mod) => {
    const isArray = await check(mod, 'authors', mod.authors, 'array');
    if (!isArray) return false;
    return mod.authors.map((author) => [
      check(mod, 'authors.author.name', author.name, 'string'),
      check(mod, 'authors.author.email', author.email, 'email', { optional: true }),
      check(mod, 'authors.author.homepage', author.homepage, 'url'),
      check(mod, 'authors.author.avatar', author.avatar, 'url'),
    ]);
  },
  validateCSS = async (mod) => {
    const isArray = await check(mod, 'css', mod.css, 'object');
    if (!isArray) return false;
    const tests = [];
    for (let dest of ['frame', 'client', 'menu']) {
      if (!mod.css[dest]) continue;
      let test = await check(mod, `css.${dest}`, mod.css[dest], 'array');
      if (test) {
        test = mod.css[dest].map((file) =>
          check(mod, `css.${dest}.file`, file, 'file', { extension: '.css' })
        );
      }
      tests.push(test);
    }
    return tests;
  },
  validateJS = async (mod) => {
    const isArray = await check(mod, 'js', mod.js, 'object');
    if (!isArray) return false;
    const tests = [];
    for (let dest of ['frame', 'client', 'menu']) {
      if (!mod.js[dest]) continue;
      let test = await check(mod, `js.${dest}`, mod.js[dest], 'array');
      if (test) {
        test = mod.js[dest].map((file) =>
          check(mod, `js.${dest}.file`, file, 'file', { extension: '.mjs' })
        );
      }
      tests.push(test);
    }
    if (mod.js.electron) {
      const isArray = await check(mod, 'js.electron', mod.js.electron, 'array');
      if (isArray) {
        for (const file of mod.js.electron) {
          const isObject = await check(mod, 'js.electron.file', file, 'object');
          if (!isObject) {
            tests.push(false);
            continue;
          }
          tests.push([
            check(mod, 'js.electron.file.source', file.source, 'file', {
              extension: '.cjs',
            }),
            // referencing the file within the electron app
            // existence can't be validated, so only format is
            check(mod, 'js.electron.file.target', file.target, 'string', {
              extension: '.js',
            }),
          ]);
        }
      } else tests.push(false);
    }
    return tests;
  },
  validateOptions = async (mod) => {
    const { supportedEnvs, optionTypes } = require('notion-enhancer/api/registry.cjs'),
      isArray = await check(mod, 'options', mod.options, 'array');
    if (!isArray) return false;
    const tests = [];
    for (const option of mod.options) {
      const key = 'options.option',
        optTypeValid = await check(mod, `${key}.type`, option.type, optionTypes);
      if (!optTypeValid) {
        tests.push(false);
        continue;
      }
      option.environments = option.environments ?? supportedEnvs;
      tests.push([
        check(mod, `${key}.key`, option.key, 'alphanumeric'),
        check(mod, `${key}.label`, option.label, 'string'),
        check(mod, `${key}.tooltip`, option.tooltip, 'string', {
          optional: true,
        }),
        check(mod, `${key}.environments`, option.environments, 'array').then((isArray) => {
          if (!isArray) return false;
          return option.environments.map((environment) =>
            check(mod, `${key}.environments.env`, environment, supportedEnvs)
          );
        }),
      ]);
      switch (option.type) {
        case 'toggle':
          tests.push(check(mod, `${key}.value`, option.value, 'boolean'));
          break;
        case 'select': {
          let test = await check(mod, `${key}.values`, option.values, 'array');
          if (test) {
            test = option.values.map((value) =>
              check(mod, `${key}.values.value`, value, 'string')
            );
          }
          tests.push(test);
          break;
        }
        case 'text':
        case 'hotkey':
          tests.push(check(mod, `${key}.value`, option.value, 'string'));
          break;
        case 'number':
        case 'color':
          tests.push(check(mod, `${key}.value`, option.value, option.type));
          break;
        case 'file': {
          let test = await check(mod, `${key}.extensions`, option.extensions, 'array');
          if (test) {
            test = option.extensions.map((ext) =>
              check(mod, `${key}.extensions.extension`, ext, 'string')
            );
          }
          tests.push(test);
          break;
        }
      }
    }
    return tests;
  };

/**
 * internally used to validate mod.json files and provide helpful errors
 * @private
 * @param {object} mod - a mod's mod.json in object form
 * @returns {boolean} whether or not the mod has passed validation
 */
module.exports.validate = async function (mod) {
  let conditions = [
    check(mod, 'name', mod.name, 'string'),
    check(mod, 'id', mod.id, 'uuid'),
    check(mod, 'version', mod.version, 'semver'),
    validateEnvironments(mod),
    check(mod, 'description', mod.description, 'string'),
    check(mod, 'preview', mod.preview, 'file|url', { optional: true }),
    validateTags(mod),
    validateAuthors(mod),
    validateCSS(mod),
    validateJS(mod),
    validateOptions(mod),
  ];
  do {
    conditions = await Promise.all(conditions.flat(Infinity));
  } while (conditions.some((condition) => Array.isArray(condition)));
  return conditions.every((passed) => passed);
};
