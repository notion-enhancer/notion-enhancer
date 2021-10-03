/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { fmt, registry } from './_.mjs';

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
  },
  validateEnvironments = (mod) => {
    return check(mod, 'environments', mod.environments, 'array', { optional: true }).then(
      (passed) => {
        if (!passed) return false;
        if (!mod.environments) {
          mod.environments = registry.supportedEnvs;
          return true;
        }
        return mod.environments.map((tag) =>
          check(mod, 'environments.env', tag, registry.supportedEnvs)
        );
      }
    );
  },
  validateTags = (mod) => {
    return check(mod, 'tags', mod.tags, 'array').then((passed) => {
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
      return mod.tags.map((tag) => check(mod, 'tags.tag', tag, 'string'));
    });
  },
  validateAuthors = (mod) => {
    return check(mod, 'authors', mod.authors, 'array').then((passed) => {
      if (!passed) return false;
      return mod.authors.map((author) => [
        check(mod, 'authors.author.name', author.name, 'string'),
        check(mod, 'authors.author.email', author.email, 'email'),
        check(mod, 'authors.author.homepage', author.homepage, 'url'),
        check(mod, 'authors.author.avatar', author.avatar, 'url'),
      ]);
    });
  },
  validateCSS = (mod) => {
    return check(mod, 'css', mod.css, 'object').then((passed) => {
      if (!passed) return false;
      const tests = [];
      for (let dest of ['frame', 'client', 'menu']) {
        if (!mod.css[dest]) continue;
        let test = check(mod, `css.${dest}`, mod.css[dest], 'array');
        test = test.then((passed) => {
          if (!passed) return false;
          return mod.css[dest].map((file) =>
            check(mod, `css.${dest}.file`, file, 'file', { extension: '.css' })
          );
        });
        tests.push(test);
      }
      return tests;
    });
  },
  validateJS = (mod) => {
    return check(mod, 'js', mod.js, 'object').then((passed) => {
      if (!passed) return false;
      const tests = [];
      if (mod.js.client) {
        let test = check(mod, 'js.client', mod.js.client, 'array');
        test = test.then((passed) => {
          if (!passed) return false;
          return mod.js.client.map((file) =>
            check(mod, 'js.client.file', file, 'file', { extension: '.mjs' })
          );
        });
        tests.push(test);
      }
      if (mod.js.electron) {
        let test = check(mod, 'js.electron', mod.js.electron, 'array');
        test = test.then((passed) => {
          if (!passed) return false;
          return mod.js.electron.map((file) =>
            check(mod, 'js.electron.file', file, 'object').then((passed) => {
              if (!passed) return false;
              return [
                check(mod, 'js.electron.file.source', file.source, 'file', {
                  extension: '.mjs',
                }),
                // referencing the file within the electron app
                // existence can't be validated, so only format is
                check(mod, 'js.electron.file.target', file.target, 'string', {
                  extension: '.js',
                }),
              ];
            })
          );
        });
        tests.push(test);
      }
      return tests;
    });
  },
  validateOptions = (mod) => {
    return check(mod, 'options', mod.options, 'array').then((passed) => {
      if (!passed) return false;
      return mod.options.map((option) =>
        check(mod, 'options.option.type', option.type, registry.optionTypes).then((passed) => {
          if (!passed) return false;
          const tests = [
            check(mod, 'options.option.key', option.key, 'alphanumeric'),
            check(mod, 'options.option.label', option.label, 'string'),
            check(mod, 'options.option.tooltip', option.tooltip, 'string', {
              optional: true,
            }),
            check(mod, 'options.option.environments', option.environments, 'array', {
              optional: true,
            }).then((passed) => {
              if (!passed) return false;
              if (!option.environments) {
                option.environments = registry.supportedEnvs;
                return true;
              }
              return option.environments.map((environment) =>
                check(
                  mod,
                  'options.option.environments.env',
                  environment,
                  registry.supportedEnvs
                )
              );
            }),
          ];
          switch (option.type) {
            case 'toggle':
              tests.push(check(mod, 'options.option.value', option.value, 'boolean'));
              break;
            case 'select':
              tests.push(
                check(mod, 'options.option.values', option.values, 'array').then((passed) => {
                  if (!passed) return false;
                  return option.values.map((value) =>
                    check(mod, 'options.option.values.value', value, 'string')
                  );
                })
              );
              break;
            case 'text':
            case 'hotkey':
              tests.push(check(mod, 'options.option.value', option.value, 'string'));
              break;
            case 'number':
            case 'color':
              tests.push(check(mod, 'options.option.value', option.value, option.type));
              break;
            case 'file':
              tests.push(
                check(mod, 'options.option.extensions', option.extensions, 'array').then(
                  (passed) => {
                    if (!passed) return false;
                    return option.extensions.map((value) =>
                      check(mod, 'options.option.extensions.extension', value, 'string')
                    );
                  }
                )
              );
          }
          return tests;
        })
      );
    });
  };

/**
 * internally used to validate mod.json files and provide helpful errors
 * @private
 * @param {object} mod - a mod's mod.json in object form
 * @returns {boolean} whether or not the mod has passed validation
 */
export async function validate(mod) {
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
}
