/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const fs = require("fs"),
  path = require("path"),
  notionRequire = (target) => require(`../../../${target}`);

const platform = process.platform,
  version = require("notion-enhancer/package.json").version,
  enhancerUrl = (target) =>
    `notion://www.notion.so/__notion-enhancer/${target.replace(/^\//, "")}`;

const readFile = (file) => {
    // prettier-ignore
    file = file.replace(/^https:\/\/www\.notion\.so\//, "notion://www.notion.so/");
    const useFetch = file.startsWith("http") || file.startsWith("notion://");
    if (useFetch) return fetch(file).then((res) => res.text());
    return fs.readFileSync(path.resolve(`${__dirname}/../${file}`), "utf-8");
  },
  readJson = (file) => {
    // prettier-ignore
    file = file.replace(/^https:\/\/www\.notion\.so\//, "notion://www.notion.so/");
    const useFetch = file.startsWith("http") || file.startsWith("notion://");
    if (useFetch) return fetch(file).then((res) => res.json());
    return require(path.resolve(`${__dirname}/../${file}`));
  },
  reloadApp = () => {
    const { app, ipcRenderer } = require("electron");
    if (app) {
      const args = process.argv.slice(1).filter((arg) => arg !== "--startup");
      app.relaunch({ args });
      app.exit();
    } else ipcRenderer.send("notion-enhancer", "reload-app");
  };

const sendMessage = (channel, message) => {
    const { ipcRenderer } = require("electron");
    ipcRenderer.send(channel, message);
  },
  onMessage = (channel, listener) => {
    const { ipcRenderer } = require("electron");
    ipcRenderer.on(channel, listener);
  };

let __db, __statements, __transactions;
const initDatabase = (namespace, fallbacks = {}) => {
  if (Array.isArray(namespace)) namespace = namespace.join("__");
  namespace = namespace ? namespace + "__" : "";
  const namespaceify = (key) =>
    key.startsWith(namespace) ? key : namespace + key;

  __db ??= (async () => {
    const { app, ipcRenderer } = require("electron"),
      isRenderer = process?.type === "renderer",
      userData = isRenderer
        ? await ipcRenderer.invoke("notion-enhancer", "get-user-data-folder")
        : app.getPath("userData");

    const table = "settings",
      sqlite = require("better-sqlite3"),
      db = sqlite(path.resolve(`${userData}/notion-enhancer.db`)),
      init = db.prepare(`CREATE TABLE IF NOT EXISTS ${table} (
          key     TEXT PRIMARY KEY,
          value   TEXT
        )`);
    init.run();

    // schema:
    // - ("agreedToTerms") -> boolean
    // - ("profileIds") -> $profileId[]
    // - ("activeProfile") -> $profileId
    // - $profileId: ("profileName") -> string
    // - $profileId: ("telemetryEnabled") -> boolean
    // - $profileId__enabledMods: ($modId) -> boolean
    // - $profileId__$modId: ($optionKey) -> value

    __statements = {
      insert: db.prepare(`INSERT INTO ${table} (key, value) VALUES (?, ?)`),
      update: db.prepare(`UPDATE ${table} SET value = ? WHERE key = ?`),
      select: db.prepare(`SELECT * FROM ${table} WHERE key = ? LIMIT 1`),
      delete: db.prepare(`DELETE FROM ${table} WHERE key = ?`),
      dump: db.prepare(`SELECT * FROM ${table}`),
    };
    __transactions = {
      remove: db.transaction((arr) => {
        arr.forEach((key) => __statements.delete.run(key));
      }),
      set: db.transaction((obj) => {
        for (const key in obj) {
          if (__statements.select.get(key) === undefined) {
            __statements.insert.run(key, obj[key]);
          } else __statements.update.run(obj[key], key);
        }
      }),
    };
    return db;
  })();

  return {
    get: async (key) => {
      await __db;
      const fallback = fallbacks[key];
      key = namespaceify(key);
      try {
        const value = JSON.parse(__statements.select.get(key)?.value);
        return value ?? fallback;
      } catch {}
      return fallback;
    },
    set: async (key, value) => {
      await __db;
      key = namespaceify(key);
      value = JSON.stringify(value);
      __transactions.set({ [key]: value });
      return true;
    },
    remove: async (keys) => {
      await __db;
      keys = Array.isArray(keys) ? keys : [keys];
      keys = keys.map(namespaceify);
      __transactions.remove(keys);
      return true;
    },
    export: async () => {
      await __db;
      const entries = __statements.dump
        .all()
        .filter(({ key }) => key.startsWith(namespace))
        .map(({ key, value }) => [key.slice(namespace.length), value]);
      return Object.fromEntries(entries);
    },
    import: async (obj) => {
      await __db;
      const entries = Object.entries(obj) //
        .map(([key, value]) => [key.slice(namespace.length), value]);
      __transactions.set(Object.fromEntries(entries));
      return true;
    },
  };
};

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  notionRequire,
  platform,
  version,
  enhancerUrl,
  readFile,
  readJson,
  reloadApp,
  sendMessage,
  onMessage,
  initDatabase,
});
