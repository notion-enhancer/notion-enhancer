/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { fmt, registry } from './_.mjs';

/**
 * internally used to validate mod.json files and provide helpful errors
 * @private
 * @param {object} mod - a mod's mod.json in object form
 * @returns {boolean} whether or not the mod has passed validation
 */
export async function validate(mod) {
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
    for (const type of Array.isArray(types) ? [types] : types.split('|')) {
      if (type === 'file') {
        test =
          value && !value.startsWith('http')
            ? await fmt.is(`repo/${mod._dir}/${value}`, type, { extension })
            : false;
      } else test = await fmt.is(value, type, { extension });
      if (test) break;
    }
    if (!test) {
      if (optional && (await fmt.is(value, 'undefined'))) return true;
      if (error) registry._errors.push({ source: mod._dir, message: error });
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
        mod.environments = registry.supportedEnvs;
        return true;
      }
      return mod.environments.map((tag) =>
        check('environments.env', tag, registry.supportedEnvs)
      );
    }),
    check('description', mod.description, 'string'),
    check('preview', mod.preview, 'file|url', { optional: true }),
    check('tags', mod.tags, 'array').then((passed) => {
      if (!passed) return false;
      const containsCategory = mod.tags.filter((tag) =>
        ['core', 'extension', 'theme'].includes(tag)
      ).length;
      if (!containsCategory) {
        registry._errors.push({
          source: mod._dir,
          message: `invalid tags (must contain at least one of 'core', 'extension', or 'theme'): ${JSON.stringify(
            mod.tags
          )}`,
        });
        return false;
      }
      if (
        (mod.tags.includes('theme') &&
          !(mod.tags.includes('light') || mod.tags.includes('dark'))) ||
        (mod.tags.includes('light') && mod.tags.includes('dark'))
      ) {
        registry._errors.push({
          source: mod._dir,
          message: `invalid tags (themes must be either 'light' or 'dark', not neither or both): ${JSON.stringify(
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
        check('options.option.type', option.type, registry.optionTypes).then((passed) => {
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
                option.environments = registry.supportedEnvs;
                return true;
              }
              return option.environments.map((environment) =>
                check('options.option.environments.env', environment, registry.supportedEnvs)
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
