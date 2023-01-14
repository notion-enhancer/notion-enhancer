/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const fs = require("fs"),
  os = require("os"),
  path = require("path"),
  notionRequire = (target) => require(`../../../${target}`);

const platform = process.platform,
  enhancerVersion = require("notion-enhancer/package.json").version,
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
    const { app } = require("electron"),
      args = process.argv.slice(1).filter((arg) => arg !== "--startup");
    app.relaunch({ args });
    app.exit();
  };

const sendMessage = (channel, message) => {
    const { ipcRenderer } = require("electron");
    ipcRenderer.send(channel, message);
  },
  onMessage = (channel, listener) => {
    const { ipcRenderer } = require("electron");
    ipcRenderer.on(channel, listener);
  };

let __db;
const initDatabase = (namespace, fallbacks = {}) => {
  if (Array.isArray(namespace)) namespace = namespace.join("__");
  namespace = namespace ? namespace + "__" : "";

  const table = "settings",
    sqlite = require("better-sqlite3"),
    db = __db ?? sqlite(path.resolve(`${os.homedir()}/.notion-enhancer.db`)),
    init = db.prepare(`CREATE TABLE IF NOT EXISTS ${table} (
      key     TEXT PRIMARY KEY,
      value   TEXT
    )`);
  init.run();
  __db = db;

  // prettier-ignore
  const insert = db.prepare(`INSERT INTO ${table} (key, value) VALUES (?, ?)`),
    // prettier-ignore
    update = db.prepare(`UPDATE ${table} SET value = ? WHERE key = ?`),
    select = db.prepare(`SELECT * FROM ${table} WHERE key = ? LIMIT 1`),
    dump = db.prepare(`SELECT * FROM ${table}`),
    populate = db.transaction((obj) => {
      for (const key in obj) {
        if (select.get(key)) update.run(obj[key], key);
        else insert.run(key, obj[key]);
      }
    });

  return {
    get: (key) => {
      const fallback = fallbacks[key];
      key = key.startsWith(namespace) ? key : namespace + key;
      try {
        return JSON.parse(select.get(key)?.value);
      } catch {
        return select.get(key)?.value ?? fallback;
      }
    },
    set: (key, value) => {
      key = key.startsWith(namespace) ? key : namespace + key;
      value = JSON.stringify(value);
      return select.get(key) === undefined
        ? insert.run(key, value)
        : update.run(value, key);
    },
    dump: () => {
      const entries = dump
        .all()
        .map(({ key, value }) => [key, value])
        .filter(([key]) => key.startsWith(namespace));
      return Object.fromEntries(entries);
    },
    populate,
  };
};

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  notionRequire,
  platform,
  enhancerUrl,
  enhancerVersion,
  readFile,
  readJson,
  reloadApp,
  sendMessage,
  onMessage,
  initDatabase,
});
