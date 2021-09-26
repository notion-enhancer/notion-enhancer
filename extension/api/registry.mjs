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

import * as regex from './regex.mjs';

/** mod ids whitelisted as part of the enhancer's core, permanently enabled */
export const CORE = [
  'a6621988-551d-495a-97d8-3c568bca2e9e',
  '0f0bf8b6-eae6-4273-b307-8fc43f2ee082',
];

/**
 * internally used to validate mod.json files and provide helpful errors
 * @private
 * @param {object} mod - a mod's mod.json in object form
 * @param {*} err - a callback to execute if a test fails
 * @param {*} check - a function to test a condition
 * @returns {array} the results of the validation
 */
registry.validate = async (mod, err, check) => {
  let conditions = [
    check('name', mod.name, typeof mod.name === 'string'),
    check('id', mod.id, typeof mod.id === 'string').then((id) =>
      id === env.ERROR ? env.ERROR : regex.uuid(id, err)
    ),
    check('version', mod.version, typeof mod.version === 'string').then((version) =>
      version === env.ERROR ? env.ERROR : regex.semver(version, err)
    ),
    check('description', mod.description, typeof mod.description === 'string'),
    check(
      'preview',
      mod.preview,
      mod.preview === undefined || typeof mod.preview === 'string'
    ).then((preview) =>
      preview ? (preview === env.ERROR ? env.ERROR : regex.url(preview, err)) : undefined
    ),
    check('tags', mod.tags, Array.isArray(mod.tags)).then((tags) =>
      tags === env.ERROR
        ? env.ERROR
        : tags.map((tag) => check('tag', tag, typeof tag === 'string'))
    ),
    check('authors', mod.authors, Array.isArray(mod.authors)).then((authors) =>
      authors === env.ERROR
        ? env.ERROR
        : authors.map((author) => [
            check('author.name', author.name, typeof author.name === 'string'),
            check('author.email', author.email, typeof author.email === 'string').then(
              (email) => (email === env.ERROR ? env.ERROR : regex.email(email, err))
            ),
            check('author.url', author.url, typeof author.url === 'string').then((url) =>
              url === env.ERROR ? env.ERROR : regex.url(url, err)
            ),
            check('author.icon', author.icon, typeof author.icon === 'string').then((icon) =>
              icon === env.ERROR ? env.ERROR : regex.url(icon, err)
            ),
          ])
    ),
    check(
      'environments',
      mod.environments,
      !mod.environments || Array.isArray(mod.environments)
    ).then((environments) =>
      environments
        ? environments === env.ERROR
          ? env.ERROR
          : environments.map((environment) =>
              check('environment', environment, env.supported.includes(environment))
            )
        : undefined
    ),
    check(
      'css',
      mod.css,
      mod.css && typeof mod.css === 'object' && !Array.isArray(mod.css)
    ).then((css) =>
      css
        ? css === env.ERROR
          ? env.ERROR
          : ['frame', 'client', 'menu']
              .filter((dest) => css[dest])
              .map(async (dest) =>
                check(`css.${dest}`, css[dest], Array.isArray(css[dest])).then((files) =>
                  files === env.ERROR
                    ? env.ERROR
                    : files.map(async (file) =>
                        check(
                          `css.${dest} file`,
                          file,
                          await fs.isFile(`repo/${mod._dir}/${file}`, '.css')
                        )
                      )
                )
              )
        : undefined
    ),
    check('js', mod.js, mod.js && typeof mod.js === 'object' && !Array.isArray(mod.js)).then(
      async (js) => {
        if (js === env.ERROR) return env.ERROR;
        if (!js) return undefined;
        return [
          check('js.client', js.client, !js.client || Array.isArray(js.client)).then(
            (client) => {
              if (client === env.ERROR) return env.ERROR;
              if (!client) return undefined;
              return client.map(async (file) =>
                check(
                  'js.client file',
                  file,
                  await fs.isFile(`repo/${mod._dir}/${file}`, '.js')
                )
              );
            }
          ),
          check('js.electron', js.electron, !js.electron || Array.isArray(js.electron)).then(
            (electron) => {
              if (electron === env.ERROR) return env.ERROR;
              if (!electron) return undefined;
              return electron.map((file) =>
                check(
                  'js.electron file',
                  file,
                  file && typeof file === 'object' && !Array.isArray(file)
                ).then(async (file) =>
                  file === env.ERROR
                    ? env.ERROR
                    : [
                        check(
                          'js.electron file source',
                          file.source,
                          await fs.isFile(`repo/${mod._dir}/${file.source}`, '.js')
                        ),
                        // referencing the file within the electron app
                        // existence can't be validated, so only format is
                        check(
                          'js.electron file target',
                          file.target,
                          typeof file.target === 'string' && file.target.endsWith('.js')
                        ),
                      ]
                )
              );
            }
          ),
        ];
      }
    ),
    check('options', mod.options, Array.isArray(mod.options)).then((options) =>
      options === env.ERROR
        ? env.ERROR
        : options.map((option) => {
            const conditions = [];
            switch (option.type) {
              case 'toggle':
                conditions.push(
                  check('option.value', option.value, typeof option.value === 'boolean')
                );
                break;
              case 'select':
                conditions.push(
                  check('option.values', option.values, Array.isArray(option.values)).then(
                    (value) =>
                      value === env.ERROR
                        ? env.ERROR
                        : value.map((option) =>
                            check('option.values option', option, typeof option === 'string')
                          )
                  )
                );
                break;
              case 'text':
                conditions.push(
                  check('option.value', option.value, typeof option.value === 'string')
                );
                break;
              case 'number':
                conditions.push(
                  check('option.value', option.value, typeof option.value === 'number')
                );
                break;
              case 'color':
                conditions.push(
                  check('option.value', option.value, typeof option.value === 'string').then(
                    (color) => (color === env.ERROR ? env.ERROR : regex.color(color, err))
                  )
                );
                break;
              case 'file':
                conditions.push(
                  check(
                    'option.extensions',
                    option.extensions,
                    !option.extensions || Array.isArray(option.extensions)
                  ).then((extensions) =>
                    extensions
                      ? extensions === env.ERROR
                        ? env.ERROR
                        : extensions.map((ext) =>
                            check('option.extension', ext, typeof ext === 'string')
                          )
                      : undefined
                  )
                );
                break;
              default:
                return check('option.type', option.type, false);
            }
            return [
              conditions,
              check(
                'option.key',
                option.key,
                typeof option.key === 'string' && !option.key.match(/\s/)
              ),
              check('option.label', option.label, typeof option.label === 'string'),
              check(
                'option.tooltip',
                option.tooltip,
                !option.tooltip || typeof option.tooltip === 'string'
              ),
              check(
                'option.environments',
                option.environments,
                !option.environments || Array.isArray(option.environments)
              ).then((environments) =>
                environments
                  ? environments === env.ERROR
                    ? env.ERROR
                    : environments.map((environment) =>
                        check(
                          'option.environment',
                          environment,
                          env.supported.includes(environment)
                        )
                      )
                  : undefined
              ),
            ];
          })
    ),
  ];
  do {
    conditions = await Promise.all(conditions.flat(Infinity));
  } while (conditions.some((condition) => Array.isArray(condition)));
  return conditions;
};

/**
 * get the default values of a mod's options according to its mod.json
 * @param {string} id - the uuid of the mod
 * @returns {object} the mod's default values
 */
export const defaults = async (id) => {
  const mod = regex.uuid(id) ? (await registry.get()).find((mod) => mod.id === id) : undefined;
  if (!mod || !mod.options) return {};
  const defaults = {};
  for (const opt of mod.options) {
    switch (opt.type) {
      case 'toggle':
      case 'text':
      case 'number':
      case 'color':
        defaults[opt.key] = opt.value;
        break;
      case 'select':
        defaults[opt.key] = opt.values[0];
        break;
      case 'file':
        defaults[opt.key] = undefined;
        break;
    }
  }
  return defaults;
};

/**
 * get all available mods in the repo
 * @param {function} filter - a function to filter out mods
 * @returns {array} the filtered and validated list of mod.json objects
 * @example
 * // will only get mods that are enabled in the current environment
 * await registry.get((mod) => registry.isEnabled(mod.id))
 */
export const get = async (filter = (mod) => true) => {
  if (!registry._errors) registry._errors = [];
  if (!registry._list || !registry._list.length) {
    registry._list = [];
    for (const dir of await fs.getJSON('repo/registry.json')) {
      const err = (message) => [registry._errors.push({ source: dir, message }), env.ERROR][1];
      try {
        const mod = await fs.getJSON(`repo/${dir}/mod.json`);
        mod._dir = dir;
        mod.tags = mod.tags ?? [];
        mod.css = mod.css ?? {};
        mod.js = mod.js ?? {};
        mod.options = mod.options ?? [];
        const check = (prop, value, condition) =>
            Promise.resolve(
              condition ? value : err(`invalid ${prop} ${JSON.stringify(value)}`)
            ),
          validation = await registry.validate(mod, err, check);
        if (validation.every((condition) => condition !== env.ERROR)) registry._list.push(mod);
      } catch {
        err('invalid mod.json');
      }
    }
  }
  const list = [];
  for (const mod of registry._list) if (await filter(mod)) list.push(mod);
  return list;
};

/**
 * gets a list of errors encountered while validating the mod.json files
 * @returns {object} - {source: directory, message: string }
 */
registry.errors = async () => {
  if (!registry._errors) await registry.get();
  return registry._errors;
};

/**
 * checks if a mod is enabled: affected by the core whitelist,
 * environment and menu configuration
 * @param {string} id - the uuid of the mod
 * @returns {boolean} whether or not the mod is enabled
 */
registry.isEnabled = async (id) => {
  const mod = (await registry.get()).find((mod) => mod.id === id);
  if (mod.environments && !mod.environments.includes(env.name)) return false;
  if (registry.CORE.includes(id)) return true;
  return await storage.get('_mods', id, false);
};
