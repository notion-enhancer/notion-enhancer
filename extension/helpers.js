/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export const ERROR = Symbol();

export const env = {};
env.name = 'extension';
env.version = chrome.runtime.getManifest().version;

env.openEnhancerMenu = () => chrome.runtime.sendMessage({ action: 'openEnhancerMenu' });
env.focusNotion = () => chrome.runtime.sendMessage({ action: 'focusNotion' });

/** - */

export const storage = {};

storage.set = (id, key, value) =>
  new Promise((res, rej) => chrome.storage.sync.set({ [`[${id}]${key}`]: value }, res));
storage.get = (id, key, fallback = undefined) =>
  new Promise((res, rej) =>
    chrome.storage.sync.get([`[${id}]${key}`], (values) =>
      res(values[`[${id}]${key}`] ?? fallback)
    )
  );

/** - */

export const web = {};

web.whenReady = (selectors = [], callback = () => {}) => {
  return new Promise((res, rej) => {
    function onLoad() {
      let isReadyInt;
      isReadyInt = setInterval(isReadyTest, 100);
      function isReadyTest() {
        if (selectors.every((selector) => document.querySelector(selector))) {
          clearInterval(isReadyInt);
          callback();
          res(true);
        }
      }
      isReadyTest();
    }
    if (document.readyState !== 'complete') {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState === 'complete') onLoad();
      });
    } else onLoad();
  });
};

/**
 * @param {string} html
 * @returns HTMLElement
 */
web.createElement = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html.includes('<pre')
    ? html.trim()
    : html
        .split(/\n/)
        .map((line) => line.trim())
        .join(' ');
  return template.content.firstElementChild;
};
web.escapeHtml = (str) =>
  str
    .replace(/&/g, '&amp;') // (?![^\s]+;)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');

// why a tagged template? because it syntax highlights
// https://marketplace.visualstudio.com/items?itemName=bierner.lit-html
web.html = (html, ...templates) => html.map((str) => str + (templates.shift() || '')).join('');

/**
 * @param {string} sheet
 */
web.loadStyleset = (sheet) => {
  document.head.appendChild(
    web.createElement(`<link rel="stylesheet" href="${chrome.runtime.getURL(sheet)}">`)
  );
  return true;
};

/**
 * @param {array} keys
 * @param {function} callback
 */
web.hotkeyListener = (keys, callback) => {
  if (!web._hotkeyListener) {
    web._hotkeys = [];
    web._hotkeyListener = document.addEventListener('keyup', (event) => {
      for (let hotkey of web._hotkeys) {
        const matchesEvent = hotkey.keys.every((key) => {
          const modifiers = {
            altKey: 'alt',
            ctrlKey: 'ctrl',
            metaKey: 'meta',
            shiftKey: 'shift',
          };
          for (let modifier in modifiers) {
            if (key.toLowerCase() === modifiers[modifier] && event[modifier]) return true;
          }
          const pressedKeycode = [event.key.toLowerCase(), event.code.toLowerCase()];
          if (pressedKeycode.includes(key.toLowerCase())) return true;
        });
        if (matchesEvent) hotkey.callback();
      }
    });
  }
  web._hotkeys.push({ keys, callback });
};

/** - */

export const fmt = {};

import './dep/prism.js';
fmt.Prism = Prism;
fmt.Prism.manual = true;
fmt.Prism.hooks.add('complete', async (event) => {
  event.element.parentElement.removeAttribute('tabindex');
  event.element.parentElement.parentElement
    .querySelector('.copy-to-clipboard-button')
    .prepend(web.createElement(await fs.getText('icons/fa/copy.svg')));
  // if (!fmt.Prism._stylesheetLoaded) {
  //   web.loadStyleset('./dep/prism.css');
  //   fmt.Prism._stylesheetLoaded = true;
  // }
});
// delete globalThis['Prism'];

import './dep/markdown-it.min.js';
fmt.md = new markdownit({
  linkify: true,
  highlight: (str, lang) =>
    web.html`<pre class="language-${lang || 'plaintext'} match-braces"><code>${web.escapeHtml(
      str
    )}</code></pre>`,
});
fmt.md.renderer.rules.code_block = (tokens, idx, options, env, slf) => {
  const attrIdx = tokens[idx].attrIndex('class');
  if (attrIdx === -1) {
    tokens[idx].attrPush(['class', 'match-braces language-plaintext']);
  } else tokens[idx].attrs[attrIdx][1] = 'match-braces language-plaintext';
  return web.html`<pre${slf.renderAttrs(tokens[idx])}><code>${web.escapeHtml(
    tokens[idx].content
  )}</code></pre>\n`;
};
fmt.md.core.ruler.push(
  'heading_ids',
  function (md, state) {
    const slugs = new Set();
    state.tokens.forEach(function (token, i) {
      if (token.type === 'heading_open') {
        const text = md.renderer.render(state.tokens[i + 1].children, md.options),
          slug = fmt.slugger(text, slugs);
        slugs.add(slug);
        const attrIdx = token.attrIndex('id');
        if (attrIdx === -1) {
          token.attrPush(['id', slug]);
        } else token.attrs[attrIdx][1] = slug;
      }
    });
  }.bind(null, fmt.md)
);
// delete globalThis['markdownit'];

fmt.slugger = (heading, slugs = new Set()) => {
  heading = heading
    .replace(/\s/g, '-')
    .replace(/[^A-Za-z0-9-_]/g, '')
    .toLowerCase();
  let i = 0,
    slug = heading;
  while (slugs.has(slug)) {
    i++;
    slug = `${heading}-${i}`;
  }
  return slug;
};

/** - */

export const fs = {};

/**
 * @param {string} path
 */
fs.getJSON = (path) =>
  fetch(path.startsWith('https://') ? path : chrome.runtime.getURL(path)).then((res) =>
    res.json()
  );
fs.getText = (path) =>
  fetch(path.startsWith('https://') ? path : chrome.runtime.getURL(path)).then((res) =>
    res.text()
  );

fs.isFile = async (path) => {
  try {
    await fetch(chrome.runtime.getURL(path));
    return true;
  } catch {
    return false;
  }
};

/** - */

export const regexers = {
  uuid(str) {
    const match = str.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    if (match && match.length) return true;
    error(`invalid uuid ${str}`);
    return false;
  },
  semver(str) {
    const match = str.match(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/i
    );
    if (match && match.length) return true;
    error(`invalid semver ${str}`);
    return false;
  },
  email(str) {
    const match = str.match(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
    );
    if (match && match.length) return true;
    error(`invalid email ${str}`);
    return false;
  },
  url(str) {
    const match = str.match(
      /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i
    );
    if (match && match.length) return true;
    error(`invalid url ${str}`);
    return false;
  },
};

/** - */

export const registry = {};

registry.validate = async (mod, err, check) => {
  let conditions = [
    check('name', mod.name, typeof mod.name === 'string'),
    check('id', mod.id, typeof mod.id === 'string').then((id) =>
      id === ERROR ? ERROR : regexers.uuid(id)
    ),
    check('version', mod.version, typeof mod.version === 'string').then((version) =>
      version === ERROR ? ERROR : regexers.semver(version)
    ),
    check('description', mod.description, typeof mod.description === 'string'),
    check(
      'preview',
      mod.preview,
      mod.preview === undefined || typeof mod.preview === 'string'
    ).then((preview) =>
      preview ? (preview === ERROR ? ERROR : regexers.url(preview)) : undefined
    ),
    check('tags', mod.tags, Array.isArray(mod.tags)).then((tags) =>
      tags === ERROR ? ERROR : tags.map((tag) => check('tag', tag, typeof tag === 'string'))
    ),
    check('authors', mod.authors, Array.isArray(mod.authors)).then((authors) =>
      authors === ERROR
        ? ERROR
        : authors.map((author) => [
            check('author.name', author.name, typeof author.name === 'string'),
            check(
              'author.email',
              author.email,
              typeof author.email === 'string'
            ).then((email) => (email === ERROR ? ERROR : regexers.email(email))),
            check('author.url', author.url, typeof author.url === 'string').then((url) =>
              url === ERROR ? ERROR : regexers.url(url)
            ),
            check('author.icon', author.icon, typeof author.icon === 'string').then((icon) =>
              icon === ERROR ? ERROR : regexers.url(icon)
            ),
          ])
    ),
    check(
      'css',
      mod.css,
      mod.css && typeof mod.css === 'object' && !Array.isArray(mod.css)
    ).then((css) =>
      css
        ? css === ERROR
          ? ERROR
          : ['frame', 'client', 'menu']
              .filter((dest) => css[dest])
              .map(async (dest) =>
                check(`css.${dest}`, css[dest], Array.isArray(css[dest])).then((files) =>
                  files === ERROR
                    ? ERROR
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
        if (js === ERROR) return ERROR;
        if (!js) return undefined;
        return [
          check('js.client', js.client, !js.client || Array.isArray(js.client)).then(
            (client) => {
              if (client === ERROR) return ERROR;
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
              if (electron === ERROR) return ERROR;
              if (!electron) return undefined;
              return electron.map((file) =>
                check(
                  'js.electron file',
                  file,
                  file && typeof file === 'object' && !Array.isArray(file)
                ).then(async (file) =>
                  file === ERROR
                    ? ERROR
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
      options === ERROR
        ? ERROR
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
                  check(
                    'option.values',
                    option.values,
                    Array.isArray(option.values)
                  ).then((value) =>
                    value === ERROR
                      ? ERROR
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
              case 'file':
                conditions.push(
                  check(
                    'option.extensions',
                    option.extensions,
                    !option.extensions || Array.isArray(option.extensions)
                  ).then((extensions) =>
                    extensions
                      ? extensions === ERROR
                        ? ERROR
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
                'option.description',
                option.description,
                !option.description || typeof option.description === 'string'
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

registry.get = async (callback = () => {}) => {
  registry._list = [];
  if (!registry._errors) registry._errors = [];
  for (const dir of await fs.getJSON('repo/registry.json')) {
    const err = (message) => [registry._errors.push({ source: dir, message }), ERROR][1];
    try {
      const mod = await fs.getJSON(`repo/${dir}/mod.json`);
      mod._dir = dir;
      mod.tags = mod.tags ?? [];
      mod.css = mod.css ?? [];
      mod.js = mod.js ?? {};
      mod.options = mod.options ?? [];

      const check = (prop, value, condition) =>
          Promise.resolve(condition ? value : err(`invalid ${prop} ${JSON.stringify(value)}`)),
        validation = await registry.validate(mod, err, check);
      if (validation.every((condition) => condition !== ERROR)) registry._list.push(mod);
    } catch (e) {
      err('invalid mod.json');
    }
  }
  callback(registry._list);
  return registry._list;
};

registry.errors = async (callback = () => {}) => {
  if (!registry._errors) await registry.get();
  callback(registry._errors);
  return registry._errors;
};
