var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name3 in all)
    __defProp(target, name3, { get: all[name3], enumerable: true });
};

// insert/api/index.mjs
__export(exports, {
  components: () => components_exports,
  electron: () => electron_exports,
  env: () => env_exports,
  fmt: () => fmt_exports,
  fs: () => fs_exports,
  registry: () => registry_exports,
  storage: () => storage_exports,
  web: () => web_exports
});

// insert/api/env.mjs
var env_exports = {};
__export(env_exports, {
  focusMenu: () => focusMenu2,
  focusNotion: () => focusNotion2,
  name: () => name2,
  notionRequire: () => notionRequire2,
  reload: () => reload2,
  version: () => version2
});

// insert/env/env.mjs
"use strict";
var name = globalThis.__enhancerElectronApi.platform;
var version = globalThis.__enhancerElectronApi.version;
var focusMenu = globalThis.__enhancerElectronApi.focusMenu;
var focusNotion = globalThis.__enhancerElectronApi.focusNotion;
var reload = globalThis.__enhancerElectronApi.reload;
var notionRequire = globalThis.__enhancerElectronApi.notionRequire;

// insert/api/env.mjs
"use strict";
var name2 = name;
var version2 = version;
var focusMenu2 = focusMenu;
var focusNotion2 = focusNotion;
var reload2 = reload;
var notionRequire2 = notionRequire;

// insert/api/fs.mjs
var fs_exports = {};
__export(fs_exports, {
  getJSON: () => getJSON2,
  getText: () => getText2,
  isFile: () => isFile2,
  localPath: () => localPath2
});

// insert/env/fs.mjs
"use strict";
var localPath = (path) => `notion://www.notion.so/__notion-enhancer/${path}`;
var getJSON = (path, opts = {}) => {
  if (path.startsWith("http"))
    return fetch(path, opts).then((res) => res.json());
  try {
    return globalThis.__enhancerElectronApi.nodeRequire(`notion-enhancer/${path}`);
  } catch (err) {
    return fetch(localPath(path), opts).then((res) => res.json());
  }
};
var getText = (path, opts = {}) => {
  if (path.startsWith("http"))
    return fetch(path, opts).then((res) => res.text());
  try {
    const fs2 = globalThis.__enhancerElectronApi.nodeRequire("fs"), { resolve: resolvePath } = globalThis.__enhancerElectronApi.nodeRequire("path");
    return fs2.readFileSync(resolvePath(`${__dirname}/../../${path}`));
  } catch (err) {
    return fetch(localPath(path), opts).then((res) => res.text());
  }
};
var isFile = async (path) => {
  try {
    const fs2 = globalThis.__enhancerElectronApi.nodeRequire("fs"), { resolve: resolvePath } = globalThis.__enhancerElectronApi.nodeRequire("path");
    if (path.startsWith("http")) {
      await fetch(path);
    } else {
      try {
        fs2.existsSync(resolvePath(`${__dirname}/../../${path}`));
      } catch (err) {
        await fetch(localPath(path));
      }
    }
    return true;
  } catch {
    return false;
  }
};

// insert/api/fs.mjs
"use strict";
var localPath2 = localPath;
var getJSON2 = getJSON;
var getText2 = getText;
var isFile2 = isFile;

// insert/api/storage.mjs
var storage_exports = {};
__export(storage_exports, {
  addChangeListener: () => addChangeListener2,
  db: () => db2,
  get: () => get2,
  removeChangeListener: () => removeChangeListener2,
  set: () => set2
});

// insert/env/storage.mjs
"use strict";
var get = (path, fallback = void 0) => {
  return globalThis.__enhancerElectronApi.db.get(path, fallback);
};
var set = (path, value) => {
  return globalThis.__enhancerElectronApi.db.set(path, value);
};
var db = (namespace, getFunc = get, setFunc = set) => {
  if (typeof namespace === "string")
    namespace = [namespace];
  return {
    get: (path = [], fallback = void 0) => getFunc([...namespace, ...path], fallback),
    set: (path, value) => setFunc([...namespace, ...path], value)
  };
};
var addChangeListener = (callback) => {
  return globalThis.__enhancerElectronApi.db.addChangeListener(callback);
};
var removeChangeListener = (callback) => {
  return globalThis.__enhancerElectronApi.db.removeChangeListener(callback);
};

// insert/api/storage.mjs
"use strict";
var get2 = get;
var set2 = set;
var db2 = db;
var addChangeListener2 = addChangeListener;
var removeChangeListener2 = removeChangeListener;

// insert/api/electron.mjs
var electron_exports = {};
__export(electron_exports, {
  browser: () => browser,
  onMessage: () => onMessage,
  sendMessage: () => sendMessage,
  sendMessageToHost: () => sendMessageToHost,
  webFrame: () => webFrame
});
"use strict";
var browser = globalThis.__enhancerElectronApi?.browser;
var webFrame = globalThis.__enhancerElectronApi?.webFrame;
var sendMessage = globalThis.__enhancerElectronApi?.ipcRenderer?.sendMessage;
var sendMessageToHost = globalThis.__enhancerElectronApi?.ipcRenderer?.sendMessageToHost;
var onMessage = globalThis.__enhancerElectronApi?.ipcRenderer?.onMessage;

// insert/api/fmt.mjs
var fmt_exports = {};
__export(fmt_exports, {
  is: () => is,
  rgbContrast: () => rgbContrast,
  rgbLogShade: () => rgbLogShade,
  slugger: () => slugger,
  uuidv4: () => uuidv4
});
"use strict";
var slugger = (heading, slugs = new Set()) => {
  heading = heading.replace(/\s/g, "-").replace(/[^A-Za-z0-9-_]/g, "").toLowerCase();
  let i = 0, slug = heading;
  while (slugs.has(slug)) {
    i++;
    slug = `${heading}-${i}`;
  }
  return slug;
};
var uuidv4 = () => {
  if (crypto?.randomUUID)
    return crypto.randomUUID();
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
};
var rgbLogShade = (p, c) => {
  var i = parseInt, r = Math.round, [a, b, c, d] = c.split(","), P = p < 0, t = P ? 0 : p * 255 ** 2, P = P ? 1 + p : 1 - p;
  return "rgb" + (d ? "a(" : "(") + r((P * i(a[3] == "a" ? a.slice(5) : a.slice(4)) ** 2 + t) ** 0.5) + "," + r((P * i(b) ** 2 + t) ** 0.5) + "," + r((P * i(c) ** 2 + t) ** 0.5) + (d ? "," + d : ")");
};
var rgbContrast = (r, g, b) => {
  return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)) > 165.75 ? "rgb(0,0,0)" : "rgb(255,255,255)";
};
var patterns = {
  alphanumeric: /^[\w\.-]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  semver: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/i,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i,
  url: /^[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,64}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i,
  color: /^(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^\)]*\)$/i
};
function test(str, pattern) {
  const match = str.match(pattern);
  return !!(match && match.length);
}
var is = async (value, type, { extension = "" } = {}) => {
  extension = !value || !value.endsWith || value.endsWith(extension);
  if (Array.isArray(type)) {
    return type.includes(value);
  }
  switch (type) {
    case "array":
      return Array.isArray(value);
    case "object":
      return value && typeof value === "object" && !Array.isArray(value);
    case "undefined":
    case "boolean":
    case "number":
      return typeof value === type && extension;
    case "string":
      return typeof value === type && extension;
    case "alphanumeric":
    case "uuid":
    case "semver":
    case "email":
    case "url":
    case "color":
      return typeof value === "string" && test(value, patterns[type]) && extension;
    case "file":
      return typeof value === "string" && value && await fs_exports.isFile(value) && extension;
  }
  return false;
};

// insert/api/registry.mjs
var registry_exports = {};
__export(registry_exports, {
  core: () => core,
  db: () => db3,
  enabled: () => enabled,
  errors: () => errors,
  get: () => get3,
  list: () => list,
  optionDefault: () => optionDefault,
  optionTypes: () => optionTypes,
  profileDB: () => profileDB,
  profileName: () => profileName,
  supportedEnvs: () => supportedEnvs
});

// insert/api/registry-validation.mjs
"use strict";
var check = async (mod, key, value, types, {
  extension = "",
  error = `invalid ${key} (${extension ? `${extension} ` : ""}${types}): ${JSON.stringify(value)}`,
  optional = false
} = {}) => {
  let test2;
  for (const type of Array.isArray(types) ? [types] : types.split("|")) {
    if (type === "file") {
      test2 = value && !value.startsWith("http") ? await fmt_exports.is(`repo/${mod._dir}/${value}`, type, { extension }) : false;
    } else
      test2 = await fmt_exports.is(value, type, { extension });
    if (test2)
      break;
  }
  if (!test2) {
    if (optional && await fmt_exports.is(value, "undefined"))
      return true;
    if (error)
      mod._err(error);
    return false;
  }
  return true;
};
var validateEnvironments = async (mod) => {
  mod.environments = mod.environments ?? registry_exports.supportedEnvs;
  const isArray = await check(mod, "environments", mod.environments, "array");
  if (!isArray)
    return false;
  return mod.environments.map((tag) => check(mod, "environments.env", tag, registry_exports.supportedEnvs));
};
var validateTags = async (mod) => {
  const isArray = await check(mod, "tags", mod.tags, "array");
  if (!isArray)
    return false;
  const categoryTags = ["core", "extension", "theme", "integration"], containsCategory = mod.tags.filter((tag) => categoryTags.includes(tag)).length;
  if (!containsCategory) {
    mod._err(`invalid tags (must contain at least one of 'core', 'extension', 'theme' or 'integration'):
        ${JSON.stringify(mod.tags)}`);
    return false;
  }
  const isTheme = mod.tags.includes("theme"), hasThemeMode = mod.tags.includes("light") || mod.tags.includes("dark"), isBothThemeModes = mod.tags.includes("light") && mod.tags.includes("dark");
  if (isTheme && (!hasThemeMode || isBothThemeModes)) {
    mod._err(`invalid tags (themes must be either 'light' or 'dark', not neither or both):
        ${JSON.stringify(mod.tags)}`);
    return false;
  }
  return mod.tags.map((tag) => check(mod, "tags.tag", tag, "string"));
};
var validateAuthors = async (mod) => {
  const isArray = await check(mod, "authors", mod.authors, "array");
  if (!isArray)
    return false;
  return mod.authors.map((author) => [
    check(mod, "authors.author.name", author.name, "string"),
    check(mod, "authors.author.email", author.email, "email", { optional: true }),
    check(mod, "authors.author.homepage", author.homepage, "url"),
    check(mod, "authors.author.avatar", author.avatar, "url")
  ]);
};
var validateCSS = async (mod) => {
  const isArray = await check(mod, "css", mod.css, "object");
  if (!isArray)
    return false;
  const tests = [];
  for (let dest of ["frame", "client", "menu"]) {
    if (!mod.css[dest])
      continue;
    let test2 = await check(mod, `css.${dest}`, mod.css[dest], "array");
    if (test2) {
      test2 = mod.css[dest].map((file) => check(mod, `css.${dest}.file`, file, "file", { extension: ".css" }));
    }
    tests.push(test2);
  }
  return tests;
};
var validateJS = async (mod) => {
  const isArray = await check(mod, "js", mod.js, "object");
  if (!isArray)
    return false;
  const tests = [];
  for (let dest of ["frame", "client", "menu"]) {
    if (!mod.js[dest])
      continue;
    let test2 = await check(mod, `js.${dest}`, mod.js[dest], "array");
    if (test2) {
      test2 = mod.js[dest].map((file) => check(mod, `js.${dest}.file`, file, "file", { extension: ".mjs" }));
    }
    tests.push(test2);
  }
  if (mod.js.electron) {
    const isArray2 = await check(mod, "js.electron", mod.js.electron, "array");
    if (isArray2) {
      for (const file of mod.js.electron) {
        const isObject = await check(mod, "js.electron.file", file, "object");
        if (!isObject) {
          tests.push(false);
          continue;
        }
        tests.push([
          check(mod, "js.electron.file.source", file.source, "file", {
            extension: ".cjs"
          }),
          check(mod, "js.electron.file.target", file.target, "string", {
            extension: ".js"
          })
        ]);
      }
    } else
      tests.push(false);
  }
  return tests;
};
var validateOptions = async (mod) => {
  const isArray = await check(mod, "options", mod.options, "array");
  if (!isArray)
    return false;
  const tests = [];
  for (const option of mod.options) {
    const key = "options.option", optTypeValid = await check(mod, `${key}.type`, option.type, registry_exports.optionTypes);
    if (!optTypeValid) {
      tests.push(false);
      continue;
    }
    option.environments = option.environments ?? registry_exports.supportedEnvs;
    tests.push([
      check(mod, `${key}.key`, option.key, "alphanumeric"),
      check(mod, `${key}.label`, option.label, "string"),
      check(mod, `${key}.tooltip`, option.tooltip, "string", {
        optional: true
      }),
      check(mod, `${key}.environments`, option.environments, "array").then((isArray2) => {
        if (!isArray2)
          return false;
        return option.environments.map((environment) => check(mod, `${key}.environments.env`, environment, registry_exports.supportedEnvs));
      })
    ]);
    switch (option.type) {
      case "toggle":
        tests.push(check(mod, `${key}.value`, option.value, "boolean"));
        break;
      case "select": {
        let test2 = await check(mod, `${key}.values`, option.values, "array");
        if (test2) {
          test2 = option.values.map((value) => check(mod, `${key}.values.value`, value, "string"));
        }
        tests.push(test2);
        break;
      }
      case "text":
      case "hotkey":
        tests.push(check(mod, `${key}.value`, option.value, "string"));
        break;
      case "number":
      case "color":
        tests.push(check(mod, `${key}.value`, option.value, option.type));
        break;
      case "file": {
        let test2 = await check(mod, `${key}.extensions`, option.extensions, "array");
        if (test2) {
          test2 = option.extensions.map((ext) => check(mod, `${key}.extensions.extension`, ext, "string"));
        }
        tests.push(test2);
        break;
      }
    }
  }
  return tests;
};
async function validate(mod) {
  let conditions = [
    check(mod, "name", mod.name, "string"),
    check(mod, "id", mod.id, "uuid"),
    check(mod, "version", mod.version, "semver"),
    validateEnvironments(mod),
    check(mod, "description", mod.description, "string"),
    check(mod, "preview", mod.preview, "file|url", { optional: true }),
    validateTags(mod),
    validateAuthors(mod),
    validateCSS(mod),
    validateJS(mod),
    validateOptions(mod)
  ];
  do {
    conditions = await Promise.all(conditions.flat(Infinity));
  } while (conditions.some((condition) => Array.isArray(condition)));
  return conditions.every((passed) => passed);
}

// insert/api/registry.mjs
"use strict";
var core = [
  "a6621988-551d-495a-97d8-3c568bca2e9e",
  "0f0bf8b6-eae6-4273-b307-8fc43f2ee082",
  "36a2ffc9-27ff-480e-84a7-c7700a7d232d"
];
var supportedEnvs = ["linux", "win32", "darwin", "extension"];
var optionTypes = ["toggle", "select", "text", "number", "color", "file", "hotkey"];
var profileName = async () => storage_exports.get(["currentprofile"], "default");
var profileDB = async () => storage_exports.db(["profiles", await profileName()]);
var _list;
var _errors = [];
var list = async (filter = (mod) => true) => {
  if (!_list) {
    _list = new Promise(async (res, rej) => {
      const passed = [];
      for (const dir of await fs_exports.getJSON("repo/registry.json")) {
        try {
          const mod = {
            ...await fs_exports.getJSON(`repo/${dir}/mod.json`),
            _dir: dir,
            _err: (message) => _errors.push({ source: dir, message })
          };
          if (await validate(mod))
            passed.push(mod);
        } catch {
          _errors.push({ source: dir, message: "invalid mod.json" });
        }
      }
      res(passed);
    });
  }
  const filtered = [];
  for (const mod of await _list)
    if (await filter(mod))
      filtered.push(mod);
  return filtered;
};
var errors = async () => {
  await list();
  return _errors;
};
var get3 = async (id) => {
  return (await list((mod) => mod.id === id))[0];
};
var enabled = async (id) => {
  const mod = await get3(id);
  if (!mod.environments.includes(env_exports.name))
    return false;
  if (core.includes(id))
    return true;
  return (await profileDB()).get(["_mods", id], false);
};
var optionDefault = async (id, key) => {
  const mod = await get3(id), opt = mod.options.find((opt2) => opt2.key === key);
  if (!opt)
    return void 0;
  switch (opt.type) {
    case "toggle":
    case "text":
    case "number":
    case "color":
    case "hotkey":
      return opt.value;
    case "select":
      return opt.values[0];
    case "file":
      return void 0;
  }
};
var db3 = async (id) => {
  const db5 = await profileDB();
  return storage_exports.db([id], async (path, fallback = void 0) => {
    if (typeof path === "string")
      path = [path];
    if (path.length === 2) {
      fallback = await optionDefault(id, path[1]) ?? fallback;
    }
    return db5.get(path, fallback);
  }, db5.set);
};

// insert/api/web.mjs
var web_exports = {};
__export(web_exports, {
  addDocumentObserver: () => addDocumentObserver,
  addHotkeyListener: () => addHotkeyListener,
  copyToClipboard: () => copyToClipboard,
  empty: () => empty,
  escape: () => escape,
  html: () => html,
  loadStylesheet: () => loadStylesheet,
  queryParams: () => queryParams,
  raw: () => raw,
  readFromClipboard: () => readFromClipboard,
  removeDocumentObserver: () => removeDocumentObserver,
  removeHotkeyListener: () => removeHotkeyListener,
  render: () => render,
  whenReady: () => whenReady
});
"use strict";
var _hotkeyListenersActivated = false;
var _hotkeyEventListeners = [];
var _documentObserver;
var _documentObserverListeners = [];
var _documentObserverEvents = [];
var whenReady = (selectors = []) => {
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
    if (document.readyState !== "complete") {
      document.addEventListener("readystatechange", (event) => {
        if (document.readyState === "complete")
          onLoad();
      });
    } else
      onLoad();
  });
};
var queryParams = () => new URLSearchParams(window.location.search);
var escape = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/\\/g, "&#x5C;");
var raw = (str, ...templates) => {
  const html2 = str.map((chunk) => chunk + (["string", "number"].includes(typeof templates[0]) ? templates.shift() : escape(JSON.stringify(templates.shift(), null, 2) ?? ""))).join("");
  return html2.includes("<pre") ? html2.trim() : html2.split(/\n/).map((line) => line.trim()).filter((line) => line.length).join(" ");
};
var html = (str, ...templates) => {
  const $fragment = document.createRange().createContextualFragment(raw(str, ...templates));
  return $fragment.children.length === 1 ? $fragment.children[0] : $fragment.children;
};
var render = ($container, ...$elems) => {
  $elems = $elems.map(($elem) => $elem instanceof HTMLCollection ? [...$elem] : $elem).flat(Infinity).filter(($elem) => $elem);
  $container.append(...$elems);
  return $container;
};
var empty = ($container) => {
  while ($container.firstChild && $container.removeChild($container.firstChild))
    ;
  return $container;
};
var loadStylesheet = (path) => {
  const $stylesheet4 = html`<link
    rel="stylesheet"
    href="${path.startsWith("https://") ? path : fs_exports.localPath(path)}"
  />`;
  render(document.head, $stylesheet4);
  return $stylesheet4;
};
var copyToClipboard = async (str) => {
  try {
    await navigator.clipboard.writeText(str);
  } catch {
    const $el = document.createElement("textarea");
    $el.value = str;
    $el.setAttribute("readonly", "");
    $el.style.position = "absolute";
    $el.style.left = "-9999px";
    document.body.appendChild($el);
    $el.select();
    document.execCommand("copy");
    document.body.removeChild($el);
  }
};
var readFromClipboard = () => {
  return navigator.clipboard.readText();
};
var triggerHotkeyListener = (event, hotkey) => {
  const inInput = document.activeElement.nodeName === "INPUT" && !hotkey.listenInInput;
  if (inInput)
    return;
  const pressed = hotkey.keys.every((key) => {
    key = key.toLowerCase();
    const modifiers = {
      metaKey: ["meta", "os", "win", "cmd", "command"],
      ctrlKey: ["ctrl", "control"],
      shiftKey: ["shift"],
      altKey: ["alt"]
    };
    for (const modifier in modifiers) {
      const pressed2 = modifiers[modifier].includes(key) && event[modifier];
      if (pressed2)
        return true;
    }
    if (key === "space")
      key = " ";
    if (key === "plus")
      key = "+";
    if (key === event.key.toLowerCase())
      return true;
  });
  if (pressed)
    hotkey.callback(event);
};
var addHotkeyListener = (keys, callback, { listenInInput = false, keydown = false } = {}) => {
  if (typeof keys === "string")
    keys = keys.split("+");
  _hotkeyEventListeners.push({ keys, callback, listenInInput, keydown });
  if (!_hotkeyListenersActivated) {
    _hotkeyListenersActivated = true;
    document.addEventListener("keyup", (event) => {
      for (const hotkey of _hotkeyEventListeners.filter(({ keydown: keydown2 }) => !keydown2)) {
        triggerHotkeyListener(event, hotkey);
      }
    });
    document.addEventListener("keydown", (event) => {
      for (const hotkey of _hotkeyEventListeners.filter(({ keydown: keydown2 }) => keydown2)) {
        triggerHotkeyListener(event, hotkey);
      }
    });
  }
};
var removeHotkeyListener = (callback) => {
  _hotkeyEventListeners = _hotkeyEventListeners.filter((listener) => listener.callback !== callback);
};
var addDocumentObserver = (callback, selectors = []) => {
  if (!_documentObserver) {
    const handle = (queue) => {
      while (queue.length) {
        const event = queue.shift(), matchesAddedNode = ($node, selector) => $node instanceof Element && ($node.matches(selector) || $node.matches(`${selector} *`) || $node.querySelector(selector)), matchesTarget = (selector) => event.target.matches(selector) || event.target.matches(`${selector} *`) || [...event.addedNodes].some(($node) => matchesAddedNode($node, selector));
        for (const listener of _documentObserverListeners) {
          if (!listener.selectors.length || listener.selectors.some(matchesTarget)) {
            listener.callback(event);
          }
        }
      }
    };
    _documentObserver = new MutationObserver((list2, observer) => {
      if (!_documentObserverEvents.length)
        requestIdleCallback(() => handle(_documentObserverEvents));
      _documentObserverEvents.push(...list2);
    });
    _documentObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }
  _documentObserverListeners.push({ callback, selectors });
};
var removeDocumentObserver = (callback) => {
  _documentObserverListeners = _documentObserverListeners.filter((listener) => listener.callback !== callback);
};

// insert/api/components/index.mjs
var components_exports = {};
__export(components_exports, {
  addCornerAction: () => addCornerAction,
  addPanelView: () => addPanelView,
  addTooltip: () => addTooltip,
  feather: () => feather
});

// insert/api/components/tooltip.mjs
"use strict";
var $stylesheet;
var _$tooltip;
var countLines = ($el) => [...$el.getClientRects()].reduce((prev, val) => prev.some((p) => p.y === val.y) ? prev : [...prev, val], []).length;
var position = async ($ref, offsetDirection, maxLines) => {
  _$tooltip.style.top = `0px`;
  _$tooltip.style.left = `0px`;
  const rect = $ref.getBoundingClientRect(), { offsetWidth, offsetHeight } = _$tooltip, pad = 6;
  let x = rect.x, y = Math.floor(rect.y);
  if (["top", "bottom"].includes(offsetDirection)) {
    if (offsetDirection === "top")
      y -= offsetHeight + pad;
    if (offsetDirection === "bottom")
      y += rect.height + pad;
    x -= offsetWidth / 2 - rect.width / 2;
    _$tooltip.style.left = `${x}px`;
    _$tooltip.style.top = `${y}px`;
    const testLines = () => countLines(_$tooltip.firstElementChild) > maxLines, padEdgesX = testLines();
    while (testLines()) {
      _$tooltip.style.left = `${window.innerWidth - x > x ? x++ : x--}px`;
    }
    if (padEdgesX) {
      x += window.innerWidth - x > x ? pad : -pad;
      _$tooltip.style.left = `${x}px`;
    }
  }
  if (["left", "right"].includes(offsetDirection)) {
    y -= offsetHeight / 2 - rect.height / 2;
    if (offsetDirection === "left")
      x -= offsetWidth + pad;
    if (offsetDirection === "right")
      x += rect.width + pad;
    _$tooltip.style.left = `${x}px`;
    _$tooltip.style.top = `${y}px`;
  }
  return true;
};
var addTooltip = async ($ref, $content, { delay = 100, offsetDirection = "bottom", maxLines = 1 } = {}) => {
  if (!$stylesheet) {
    $stylesheet = web_exports.loadStylesheet("api/components/tooltip.css");
    _$tooltip = web_exports.html`<div id="enhancer--tooltip"></div>`;
    web_exports.render(document.body, _$tooltip);
  }
  if (!globalThis.markdownit)
    await import(fs_exports.localPath("dep/markdown-it.min.js"));
  const md = markdownit({ linkify: true });
  if (!($content instanceof Element))
    $content = web_exports.html`<div style="display:inline">
      ${$content.split("\n").map((text) => md.renderInline(text)).join("<br>")}
    </div>`;
  let displayDelay;
  $ref.addEventListener("mouseover", async (event) => {
    if (!displayDelay) {
      displayDelay = setTimeout(async () => {
        if ($ref.matches(":hover")) {
          if (_$tooltip.style.display !== "block") {
            _$tooltip.style.display = "block";
            web_exports.render(web_exports.empty(_$tooltip), $content);
            position($ref, offsetDirection, maxLines);
            await _$tooltip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 65 }).finished;
          }
        }
        displayDelay = void 0;
      }, delay);
    }
  });
  $ref.addEventListener("mouseout", async (event) => {
    displayDelay = void 0;
    if (_$tooltip.style.display === "block" && !$ref.matches(":hover")) {
      await _$tooltip.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 65 }).finished;
      _$tooltip.style.display = "";
    }
  });
};

// insert/api/components/feather.mjs
"use strict";
var _$iconSheet;
var feather = async (name3, attrs = {}) => {
  if (!_$iconSheet) {
    _$iconSheet = web_exports.html`${await fs_exports.getText("dep/feather-sprite.svg")}`;
  }
  attrs.style = ((attrs.style ? attrs.style + ";" : "") + "stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none;").trim();
  attrs.viewBox = "0 0 24 24";
  return `<svg ${Object.entries(attrs).map(([key, val]) => `${web_exports.escape(key)}="${web_exports.escape(val)}"`).join(" ")}>${_$iconSheet.getElementById(name3)?.innerHTML}</svg>`;
};

// insert/api/components/panel.mjs
"use strict";
var _views = [];
var svgExpand = web_exports.raw`<svg viewBox="-1 -1 9 11">
    <path d="M 3.5 0L 3.98809 -0.569442L 3.5 -0.987808L 3.01191 -0.569442L 3.5 0ZM 3.5 9L 3.01191
      9.56944L 3.5 9.98781L 3.98809 9.56944L 3.5 9ZM 0.488094 3.56944L 3.98809 0.569442L 3.01191
      -0.569442L -0.488094 2.43056L 0.488094 3.56944ZM 3.01191 0.569442L 6.51191 3.56944L 7.48809
      2.43056L 3.98809 -0.569442L 3.01191 0.569442ZM -0.488094 6.56944L 3.01191 9.56944L 3.98809
      8.43056L 0.488094 5.43056L -0.488094 6.56944ZM 3.98809 9.56944L 7.48809 6.56944L 6.51191
      5.43056L 3.01191 8.43056L 3.98809 9.56944Z"></path>
  </svg>`;
var $stylesheet2;
var db4;
var $notionFrame;
var $notionRightSidebar;
var $panel;
var $hoverTrigger;
var $resizeHandle;
var dragStartX;
var dragStartWidth;
var dragEventsFired;
var panelWidth;
var $notionApp;
var $pinnedToggle;
var $panelTitle;
var $header;
var $panelContent;
var $switcher;
var $switcherTrigger;
var $switcherOverlayContainer;
var panelPinnedAttr = "data-enhancer-panel-pinned";
var isPinned = () => $panel.hasAttribute(panelPinnedAttr);
var togglePanel = () => {
  const $elems = [$notionFrame, $notionRightSidebar, $hoverTrigger, $panel].filter(($el) => $el);
  if (isPinned()) {
    closeSwitcher();
    for (const $elem of $elems)
      $elem.removeAttribute(panelPinnedAttr);
  } else {
    for (const $elem of $elems)
      $elem.setAttribute(panelPinnedAttr, "true");
  }
  db4.set(["panel.pinned"], isPinned());
};
var updateWidth = async () => {
  document.documentElement.style.setProperty("--component--panel-width", panelWidth + "px");
  db4.set(["panel.width"], panelWidth);
};
var resizeDrag = (event) => {
  event.preventDefault();
  dragEventsFired = true;
  panelWidth = dragStartWidth + (dragStartX - event.clientX);
  if (panelWidth < 190)
    panelWidth = 190;
  if (panelWidth > 480)
    panelWidth = 480;
  $panel.style.width = panelWidth + "px";
  $hoverTrigger.style.width = panelWidth + "px";
  $notionFrame.style.paddingRight = panelWidth + "px";
  if ($notionRightSidebar)
    $notionRightSidebar.style.right = panelWidth + "px";
};
var resizeEnd = (event) => {
  $panel.style.width = "";
  $hoverTrigger.style.width = "";
  $notionFrame.style.paddingRight = "";
  if ($notionRightSidebar)
    $notionRightSidebar.style.right = "";
  updateWidth();
  $resizeHandle.style.cursor = "";
  document.body.removeEventListener("mousemove", resizeDrag);
  document.body.removeEventListener("mouseup", resizeEnd);
};
var resizeStart = (event) => {
  dragStartX = event.clientX;
  dragStartWidth = panelWidth;
  $resizeHandle.style.cursor = "auto";
  document.body.addEventListener("mousemove", resizeDrag);
  document.body.addEventListener("mouseup", resizeEnd);
};
var isSwitcherOpen = () => document.body.contains($switcher);
var openSwitcher = () => {
  if (!isPinned())
    return togglePanel();
  web_exports.render($notionApp, $switcherOverlayContainer);
  web_exports.empty($switcher);
  for (const view of _views) {
    const open = $panelTitle.contains(view.$title), $item = web_exports.render(web_exports.html`<div class="enhancer--panel-switcher-item" tabindex="0" ${open ? "data-open" : ""}></div>`, web_exports.render(web_exports.html`<span class="enhancer--panel-view-title"></span>`, view.$icon.cloneNode(true), view.$title.cloneNode(true)));
    $item.addEventListener("click", () => {
      renderView(view);
      db4.set(["panel.open"], view.id);
    });
    web_exports.render($switcher, $item);
  }
  const rect = $header.getBoundingClientRect();
  web_exports.render(web_exports.empty($switcherOverlayContainer), web_exports.render(web_exports.html`<div style="position: fixed; top: ${rect.top}px; left: ${rect.left}px;
              width: ${rect.width}px; height: ${rect.height}px;"></div>`, web_exports.render(web_exports.html`<div style="position: relative; top: 100%; pointer-events: auto;"></div>`, $switcher)));
  $switcher.querySelector("[data-open]").focus();
  $switcher.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
  document.addEventListener("keydown", switcherKeyListeners);
};
var closeSwitcher = () => {
  document.removeEventListener("keydown", switcherKeyListeners);
  $switcher.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).onfinish = () => $switcherOverlayContainer.remove();
};
var switcherKeyListeners = (event) => {
  if (isSwitcherOpen()) {
    switch (event.key) {
      case "Escape":
        closeSwitcher();
        event.stopPropagation();
        break;
      case "Enter":
        document.activeElement.click();
        event.stopPropagation();
        break;
      case "ArrowUp":
        const $prev = event.target.previousElementSibling;
        ($prev || event.target.parentElement.lastElementChild).focus();
        event.stopPropagation();
        break;
      case "ArrowDown":
        const $next = event.target.nextElementSibling;
        ($next || event.target.parentElement.firstElementChild).focus();
        event.stopPropagation();
        break;
    }
  }
};
var renderView = (view) => {
  const prevView = _views.find(({ $content }) => document.contains($content));
  web_exports.render(web_exports.empty($panelTitle), web_exports.render(web_exports.html`<span class="enhancer--panel-view-title"></span>`, view.$icon, view.$title));
  view.onFocus();
  web_exports.render(web_exports.empty($panelContent), view.$content);
  if (prevView)
    prevView.onBlur();
};
async function createPanel() {
  await web_exports.whenReady([".notion-frame"]);
  $notionFrame = document.querySelector(".notion-frame");
  $panel = web_exports.html`<div id="enhancer--panel"></div>`;
  $hoverTrigger = web_exports.html`<div id="enhancer--panel-hover-trigger"></div>`;
  $resizeHandle = web_exports.html`<div id="enhancer--panel-resize"><div></div></div>`;
  $panelTitle = web_exports.html`<div id="enhancer--panel-header-title"></div>`;
  $header = web_exports.render(web_exports.html`<div id="enhancer--panel-header"></div>`, $panelTitle);
  $panelContent = web_exports.html`<div id="enhancer--panel-content"></div>`;
  $switcher = web_exports.html`<div id="enhancer--panel-switcher"></div>`;
  $switcherTrigger = web_exports.html`<div id="enhancer--panel-header-switcher" tabindex="0">
    ${svgExpand}
  </div>`;
  $switcherOverlayContainer = web_exports.html`<div id="enhancer--panel-switcher-overlay-container"></div>`;
  const notionRightSidebarSelector = '.notion-cursor-listener > div[style*="flex-end"]', detectRightSidebar = () => {
    if (!document.contains($notionRightSidebar)) {
      $notionRightSidebar = document.querySelector(notionRightSidebarSelector);
      if (isPinned() && $notionRightSidebar) {
        $notionRightSidebar.setAttribute(panelPinnedAttr, "true");
      }
    }
  };
  $notionRightSidebar = document.querySelector(notionRightSidebarSelector);
  web_exports.addDocumentObserver(detectRightSidebar, [notionRightSidebarSelector]);
  if (await db4.get(["panel.pinned"]))
    togglePanel();
  web_exports.addHotkeyListener(await db4.get(["panel.hotkey"]), togglePanel);
  $pinnedToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePanel();
  });
  web_exports.render($panel, web_exports.render($header, $panelTitle, $switcherTrigger, $pinnedToggle), $panelContent, $resizeHandle);
  await enablePanelResize();
  await createViews();
  const cursorListenerSelector = '.notion-cursor-listener > .notion-sidebar-container ~ [style^="position: absolute"]';
  await web_exports.whenReady([cursorListenerSelector]);
  document.querySelector(cursorListenerSelector).before($hoverTrigger, $panel);
}
async function enablePanelResize() {
  panelWidth = await db4.get(["panel.width"], 240);
  updateWidth();
  $resizeHandle.addEventListener("mousedown", resizeStart);
  $resizeHandle.addEventListener("click", () => {
    if (dragEventsFired) {
      dragEventsFired = false;
    } else
      togglePanel();
  });
}
async function createViews() {
  $notionApp = document.querySelector(".notion-app-inner");
  $header.addEventListener("click", openSwitcher);
  $switcherTrigger.addEventListener("click", openSwitcher);
  $switcherOverlayContainer.addEventListener("click", closeSwitcher);
}
var addPanelView = async ({
  id,
  icon,
  title,
  $content,
  onFocus = () => {
  },
  onBlur = () => {
  }
}) => {
  if (!$stylesheet2) {
    $stylesheet2 = web_exports.loadStylesheet("api/components/panel.css");
  }
  if (!db4)
    db4 = await registry_exports.db("36a2ffc9-27ff-480e-84a7-c7700a7d232d");
  if (!$pinnedToggle) {
    $pinnedToggle = web_exports.html`<div id="enhancer--panel-header-toggle" tabindex="0"><div>
      ${await components_exports.feather("chevrons-right")}
    </div></div>`;
  }
  const view = {
    id,
    $icon: web_exports.render(web_exports.html`<span class="enhancer--panel-view-title-icon"></span>`, icon instanceof Element ? icon : web_exports.html`${icon}`),
    $title: web_exports.render(web_exports.html`<span class="enhancer--panel-view-title-text"></span>`, title),
    $content,
    onFocus,
    onBlur
  };
  _views.push(view);
  if (_views.length === 1)
    await createPanel();
  if (_views.length === 1 || await db4.get(["panel.open"]) === id)
    renderView(view);
};

// insert/api/components/corner-action.mjs
"use strict";
var $stylesheet3;
var $cornerButtonsContainer;
var addCornerAction = async (icon, listener) => {
  if (!$stylesheet3) {
    $stylesheet3 = web_exports.loadStylesheet("api/components/corner-action.css");
    $cornerButtonsContainer = web_exports.html`<div id="enhancer--corner-actions"></div>`;
  }
  await web_exports.whenReady([".notion-help-button"]);
  const $helpButton = document.querySelector(".notion-help-button"), $onboardingButton = document.querySelector(".onboarding-checklist-button");
  if ($onboardingButton)
    $cornerButtonsContainer.prepend($onboardingButton);
  $cornerButtonsContainer.prepend($helpButton);
  web_exports.render(document.querySelector(".notion-app-inner > .notion-cursor-listener"), $cornerButtonsContainer);
  const $actionButton = web_exports.html`<div class="enhancer--corner-action-button">${icon}</div>`;
  $actionButton.addEventListener("click", listener);
  web_exports.render($cornerButtonsContainer, $actionButton);
  return $actionButton;
};

// insert/api/components/index.mjs
"use strict";

// insert/api/index.mjs
"use strict";
