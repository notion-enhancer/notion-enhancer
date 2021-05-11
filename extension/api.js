/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

/**
 * @module notion-enhancer/api
 * @version 0.11.0
 */

'use strict';

/**
 * environment-specific methods and constants
 * @namespace env
 */
export const env = {};
/**
 * an error constant used in validation, distinct from null or undefined
 * @constant {Symbol}
 */
env.ERROR = Symbol();
/**
 * the environment/platform name code is currently being executed in
 * @constant {string}
 */
env.name = 'extension';
/**
 * all environments/platforms currently supported by the enhancer
 * @constant {array<string>}
 */
env.supported = ['linux', 'win32', 'darwin', 'extension'];
/**
 * the current version of the enhancer
 * @constant {string}
 */
env.version = chrome.runtime.getManifest().version;
/** open the enhancer's menu */
env.openEnhancerMenu = () => chrome.runtime.sendMessage({ action: 'openEnhancerMenu' });
/** focus an active notion tab */
env.focusNotion = () => chrome.runtime.sendMessage({ action: 'focusNotion' });
/** reload all notion and enhancer menu tabs to apply changes */
env.reloadTabs = () => chrome.runtime.sendMessage({ action: 'reloadTabs' });

/**
 * environment-specific data persistence
 * @namespace storage
 */
export const storage = {};
/**
 * get data persisted within an enhancer store
 * @param {string} namespace - the name of the store, e.g. a mod id
 * @param {string} [key] - the key being looked up
 * @param {*} [fallback] - a default value if the key does not exist
 * @returns {Promise} value ?? fallback
 */
storage.get = (namespace, key = undefined, fallback = undefined) =>
  new Promise((res, rej) =>
    chrome.storage.sync.get([namespace], async (values) => {
      const defaults = await registry.defaults(namespace);
      values =
        values[namespace] &&
        Object.getOwnPropertyNames(values[namespace]).length &&
        (!key || Object.getOwnPropertyNames(values[namespace]).includes(key))
          ? values[namespace]
          : defaults;
      res((key ? values[key] : values) ?? fallback);
    })
  );
/**
 * persist data to an enhancer store
 * @param {string} namespace - the name of the store, e.g. a mod id
 * @param {string} key - the key associated with the value
 * @param {*} value - the data to save
 */
storage._queue = [];
storage.set = (namespace, key, value) => {
  const precursor = storage._queue[storage._queue.length - 1] || undefined,
    interaction = new Promise(async (res, rej) => {
      if (precursor !== undefined) {
        await precursor;
        storage._queue.shift();
      }
      const values = await storage.get(namespace, undefined, {});
      if (values.hasOwnProperty(key)) delete values[key];
      storage._onChangeListeners.forEach((listener) =>
        listener({ type: 'set', namespace, key, new: value, old: values[key] })
      );
      chrome.storage.sync.set({ [namespace]: { ...values, [key]: value } }, res);
    });
  storage._queue.push(interaction);
  return interaction;
};
/**
 * clear data from an enhancer store
 * @param {string} namespace - the name of the store, e.g. a mod id
 */
storage.reset = (namespace) => {
  storage._onChangeListeners.forEach((listener) =>
    listener({ type: 'reset', namespace, key: undefined, new: undefined, old: undefined })
  );
  return new Promise((res, rej) => chrome.storage.sync.set({ [namespace]: undefined }, res));
};
storage._onChangeListeners = [];
/**
 * add an event listener for changes in storage
 * @param {onStorageChangeCallback} callback - called whenever a change in
 * storage is initiated from the current process
 */
storage.addChangeListener = (callback) => {
  storage._onChangeListeners.push(callback);
};
/**
 * remove a listener added with storage.addChangeListener
 * @param {onStorageChangeCallback} callback
 */
storage.removeChangeListener = (callback) => {
  storage._onChangeListeners = storage._onChangeListeners.filter(
    (listener) => listener !== callback
  );
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

/**
 * environment-specific filesystem reading
 * @namespace fs
 */
export const fs = {};
/**
 * fetch and parse a json file's contents
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {object} the json value of the requested file as a js object
 */
fs.getJSON = (path) =>
  fetch(path.startsWith('https://') ? path : chrome.runtime.getURL(path)).then((res) =>
    res.json()
  );
/**
 * fetch a text file's contents
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {object} the text content of the requested file
 */
fs.getText = (path) =>
  fetch(path.startsWith('https://') ? path : chrome.runtime.getURL(path)).then((res) =>
    res.text()
  );
/**
 * check if a file exists
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {boolean} whether or not the file exists
 */
fs.isFile = async (path) => {
  try {
    await fetch(path.startsWith('https://') ? path : chrome.runtime.getURL(path));
    return true;
  } catch {
    return false;
  }
};

/**
 * helpers for manipulation of a webpage
 * @namespace web
 */
export const web = {};
/**
 * wait until a page is loaded and ready for modification
 * @param {array} [selectors=[]] - wait for the existence fo elements that match these css selectors
 * @returns {Promise} a promise that will resolve when the page is ready
 */
web.whenReady = (selectors = []) => {
  return new Promise((res, rej) => {
    function onLoad() {
      let isReadyInt;
      isReadyInt = setInterval(isReadyTest, 100);
      function isReadyTest() {
        if (selectors.every((selector) => document.querySelector(selector))) {
          clearInterval(isReadyInt);
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
 * loads/applies a css stylesheet to the page
 * @param {string} path - a url or within-the-enhancer filepath
 */
web.loadStyleset = (path) => {
  document.head.appendChild(
    web.createElement(
      web.html`<link rel="stylesheet" href="${
        path.startsWith('https://') ? path : chrome.runtime.getURL(path)
      }">`
    )
  );
  return true;
};
/**
 * fetch an icon from the icons folder
 * @param {string} path - the path to the icon within the folder
 * @returns {string} the content of an svg file
 */
web.getIcon = (path) => fs.getText(`icons/${path}.svg`);
/** replace all [data-icon] elems with matching svgs from the icons folder */
web.loadIcons = () => {
  document.querySelectorAll('[data-icon]:not(svg:not(:empty))').forEach(async (icon) => {
    const svg = web.createElement(await web.getIcon(icon.dataset.icon));
    for (const attr of icon.attributes) {
      svg.setAttribute(attr.name, attr.value);
    }
    icon.replaceWith(svg);
  });
};
/**
 * create a html fragment (collection of nodes) from a string
 * @param {string} html - a valid html string
 * @returns {Element} the constructed html fragment
 */
web.createFragment = (html = '') => {
  return document.createRange().createContextualFragment(
    html.includes('<pre')
      ? html.trim()
      : html
          .split(/\n/)
          .map((line) => line.trim())
          .filter((line) => line.length)
          .join(' ')
  );
};
/**
 * create a single html element from a string (instead of separately
 * creating the element and then applying attributes and appending children)
 * @param {string} html - the full html of an element inc. attributes and children
 * @returns {Element} the constructed html element
 */
web.createElement = (html) => {
  return web.createFragment(html).children[0];
};
/**
 * replace special html characters with escaped versions
 * @param {string} str
 * @returns {string} escaped string
 */
web.escapeHtml = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
/**
 * a tagged template processor for syntax higlighting purposes
 * (https://marketplace.visualstudio.com/items?itemName=bierner.lit-html)
 * @example
 * const el = web.html`<p>hello</p>`; // = '<p>hello</p>'
 * document.body.append(web.createElement(el));
 */
web.html = (html, ...templates) => html.map((str) => str + (templates.shift() ?? '')).join('');
web._hotkeyEventListeners = [];
/**
 * register a hotkey listener to the page
 * @param {array} keys - the combination of keys that will trigger the hotkey.
 * key codes can be tested at http://keycode.info/.
 * available modifiers are 'alt', 'ctrl', 'meta', and 'shift'
 * @param {function} callback - called whenever the keys are pressed
 */
web.addHotkeyListener = (keys, callback) => {
  if (typeof keys === 'string') keys = keys.split('+');
  if (!web._hotkeyEvent) {
    web._hotkeyEvent = document.addEventListener('keyup', (event) => {
      for (const hotkey of web._hotkeyEventListeners) {
        const matchesEvent = hotkey.keys.every((key) => {
          const modifiers = {
            altKey: 'alt',
            ctrlKey: 'ctrl',
            metaKey: 'meta',
            shiftKey: 'shift',
          };
          for (const modifier in modifiers) {
            if (key.toLowerCase() === modifiers[modifier] && event[modifier]) return true;
          }
          const pressedKeycode = [event.key.toLowerCase(), event.code.toLowerCase()];
          if (pressedKeycode.includes(key.toLowerCase())) return true;
        });
        if (matchesEvent) hotkey.callback();
      }
    });
  }
  web._hotkeyEventListeners.push({ keys, callback });
};
/**
 * remove a listener added with web.addHotkeyListener
 * @param {function} callback
 */
web.removeHotkeyListener = (callback) => {
  web._hotkeyEventListeners = web._hotkeyEventListeners.filter(
    (listener) => listener.callback !== callback
  );
};
web._documentObserverListeners = [];
web._documentObserverEvents = [];
/**
 * add a listener to watch for changes to the dom
 * @param {onDocumentObservedCallback} callback
 * @param {array<string>} [selectors]
 */
web.addDocumentObserver = (callback, selectors = []) => {
  if (!web._documentObserver) {
    const handle = (queue) => {
      while (queue.length) {
        const event = queue.shift();
        for (const listener of web._documentObserverListeners) {
          if (
            !listener.selectors.length ||
            listener.selectors.some(
              (selector) =>
                event.target.matches(selector) || event.target.matches(`${selector} *`)
            )
          ) {
            listener.callback(event);
          }
        }
      }
    };
    web._documentObserver = new MutationObserver((list, observer) => {
      if (!web._documentObserverEvents.length)
        requestIdleCallback(() => handle(web._documentObserverEvents));
      web._documentObserverEvents.push(...list);
    });
    web._documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }
  web._documentObserverListeners.push({ callback, selectors });
};
/**
 * remove a listener added with web.addDocumentObserver
 * @param {onDocumentObservedCallback} callback
 */
web.removeDocumentObserver = (callback) => {
  web._documentObserverListeners = web._documentObserverListeners.filter(
    (listener) => listener.callback !== callback
  );
};
/**
 * @callback onDocumentObservedCallback
 * @param {MutationRecord} event - the observed dom mutation event
 */
/**
 * add a tooltip to show extra information on hover
 * @param {HTMLElement} $element - the element that will trigger the tooltip when hovered
 * @param {string} text - the markdown content of the tooltip
 */
web.addTooltip = ($element, text) => {
  if (!web._$tooltip) {
    web._$tooltip = web.createElement(web.html`<div class="enhancer--tooltip"></div>`);
    document.body.append(web._$tooltip);
  }
  text = fmt.md.render(text);
  $element.addEventListener('mouseover', (event) => {
    web._$tooltip.innerHTML = text;
    web._$tooltip.style.display = 'block';
  });
  $element.addEventListener('mousemove', (event) => {
    web._$tooltip.style.top = event.clientY - web._$tooltip.clientHeight + 'px';
    web._$tooltip.style.left =
      event.clientX < window.innerWidth / 2 ? event.clientX + 20 + 'px' : '';
  });
  $element.addEventListener('mouseout', (event) => {
    web._$tooltip.style.display = '';
  });
};

/**
 * helpers for formatting or parsing text
 * @namespace fmt
 */
export const fmt = {};
import './dep/prism.js';
/** syntax highlighting using https://prismjs.com/ */
fmt.Prism = Prism;
fmt.Prism.manual = true;
fmt.Prism.hooks.add('complete', async (event) => {
  event.element.parentElement.removeAttribute('tabindex');
  event.element.parentElement.parentElement
    .querySelector('.copy-to-clipboard-button')
    .prepend(web.createElement(await web.getIcon('fa/regular/copy')));
  // if (!fmt.Prism._stylesheetLoaded) {
  //   web.loadStyleset('./dep/prism.css');
  //   fmt.Prism._stylesheetLoaded = true;
  // }
});
// delete memberThis['Prism'];
import './dep/markdown-it.min.js';
/** markdown -> html using https://github.com/markdown-it/markdown-it/ */
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
// delete memberThis['markdownit'];
/**
 * transform a heading into a slug (a lowercase alphanumeric string separated by dashes),
 * e.g. for use as an anchor id
 * @param {string} heading - the original heading to be slugified
 * @param {Set<string>} [slugs] - a list of pre-generated slugs to avoid duplicates
 * @returns {string} the generated slug
 */
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

/**
 * pattern validators
 * @namespace regexers
 */
export const regexers = {};
/**
 * check for a valid uuid (8-4-4-4-12 hexadecimal digits)
 * @param {string} str - the string to test
 * @param {function} err - a callback to execute if the test fails
 * @returns {boolean | env.ERROR} true or the env.ERROR constant
 */
regexers.uuid = (str, err = () => {}) => {
  const match = str.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (match && match.length) return true;
  err(`invalid uuid ${str}`);
  return env.ERROR;
};
/**
 * check for a valid semver (MAJOR.MINOR.PATCH)
 * @param {string} str - the string to test
 * @param {function} err - a callback to execute if the test fails
 * @returns {boolean | env.ERROR} true or the env.ERROR constant
 */
regexers.semver = (str, err = () => {}) => {
  const match = str.match(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/i
  );
  if (match && match.length) return true;
  err(`invalid semver ${str}`);
  return env.ERROR;
};
/**
 * check for a valid email (someone@somewhere.domain)
 * @param {string} str - the string to test
 * @param {function} err - a callback to execute if the test fails
 * @returns {boolean | env.ERROR} true or the env.ERROR constant
 */
regexers.email = (str, err = () => {}) => {
  const match = str.match(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i
  );
  if (match && match.length) return true;
  err(`invalid email ${str}`);
  return env.ERROR;
};
/**
 * check for a valid url (https://example.com/path)
 * @param {string} str - the string to test
 * @param {function} err - a callback to execute if the test fails
 * @returns {boolean | env.ERROR} true or the env.ERROR constant
 */
regexers.url = (str, err = () => {}) => {
  const match = str.match(
    /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i
  );
  if (match && match.length) return true;
  err(`invalid url ${str}`);
  return env.ERROR;
};

/**
 * an api for interacting with the enhancer's repository of mods
 * @namespace registry
 */
export const registry = {};
/** mod ids whitelisted as part of the enhancer's core, permanently enabled */
registry.CORE = [
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
      id === env.ERROR ? env.ERROR : regexers.uuid(id, err)
    ),
    check('version', mod.version, typeof mod.version === 'string').then((version) =>
      version === env.ERROR ? env.ERROR : regexers.semver(version, err)
    ),
    check('description', mod.description, typeof mod.description === 'string'),
    check(
      'preview',
      mod.preview,
      mod.preview === undefined || typeof mod.preview === 'string'
    ).then((preview) =>
      preview ? (preview === env.ERROR ? env.ERROR : regexers.url(preview, err)) : undefined
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
              (email) => (email === env.ERROR ? env.ERROR : regexers.email(email, err))
            ),
            check('author.url', author.url, typeof author.url === 'string').then((url) =>
              url === env.ERROR ? env.ERROR : regexers.url(url, err)
            ),
            check('author.icon', author.icon, typeof author.icon === 'string').then((icon) =>
              icon === env.ERROR ? env.ERROR : regexers.url(icon, err)
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
registry.defaults = async (id) => {
  const mod =
    regexers.uuid(id) !== env.ERROR
      ? (await registry.get()).find((mod) => mod.id === id)
      : undefined;
  if (!mod || !mod.options) return {};
  const defaults = {};
  for (const opt of mod.options) {
    switch (opt.type) {
      case 'toggle':
        defaults[opt.key] = opt.value;
        break;
      case 'select':
        defaults[opt.key] = opt.values[0];
        break;
      case 'text':
        defaults[opt.key] = opt.value;
        break;
      case 'number':
        defaults[opt.key] = opt.value;
        break;
      case 'file':
        defaults[opt.key] = undefined;
        break;
    }
  }
  return defaults;
};
/**
 * get all available enhancer mods in the repo
 * @param {function} filter - a function to filter out mods
 * @returns {array} the filtered and validated list of mod.json objects
 * @example
 * // will only get mods that are enabled in the current environment
 * await registry.get((mod) => registry.isEnabled(mod.id))
 */
registry.get = async (filter = (mod) => true) => {
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
 * checks if a mod is core whitelisted, environment disabled or menu enabled
 * @param {string} id - the uuid of the mod
 * @returns {boolean} whether or not the mod is enabled
 */
registry.isEnabled = async (id) => {
  const mod = (await registry.get()).find((mod) => mod.id === id);
  if (mod.environments && !mod.environments.includes(env.name)) return false;
  if (registry.CORE.includes(id)) return true;
  return await storage.get('_mods', id, false);
};
