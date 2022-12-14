/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const fs = require("fs"),
  os = require("os"),
  path = require("path"),
  platform = process.platform;

const notionRequire = (target) => require(`../../../${target}`),
  notionPath = (target) => path.resolve(`${__dirname}/../../../${target}`);

const enhancerRequire = (target) => require(`../${target}`),
  enhancerPath = (target) => path.resolve(`${__dirname}/../${target}`),
  enhancerUrl = (target) =>
    `notion://www.notion.so/__notion-enhancer/${target}`,
  enhancerVersion = enhancerRequire("package.json").version,
  enhancerConfig = path.resolve(`${os.homedir()}/.notion-enhancer.db`);

const readFile = (file) => {
    // prettier-ignore
    file = file.replace(/^https:\/\/www\.notion\.so\//, "notion://www.notion.so/");
    const useFetch = file.startsWith("http") || file.startsWith("notion://");
    if (useFetch) return fetch(file).then((res) => res.text());
    return fs.readFileSync(enhancerPath(file));
  },
  readJson = (file) => {
    // prettier-ignore
    file = file.replace(/^https:\/\/www\.notion\.so\//, "notion://www.notion.so/");
    const useFetch = file.startsWith("http") || file.startsWith("notion://");
    if (useFetch) return fetch(file).then((res) => res.json());
    return require(enhancerPath(file));
  },
  reloadApp = () => {
    const { app } = require("electron"),
      args = process.argv.slice(1).filter((arg) => arg !== "--startup");
    app.relaunch({ args });
    app.exit();
  };

let __db;
const initDatabase = (namespace) => {
  if (Array.isArray(namespace)) namespace = namespace.join("__");
  namespace = namespace ? namespace + "__" : "";

  const table = "settings",
    sqlite = require("better-sqlite3"),
    db = __db ?? sqlite(enhancerConfig),
    init = db.prepare(`CREATE TABLE IF NOT EXISTS ${table} (
      key     TEXT PRIMARY KEY,
      value   TEXT,
      mtime   INTEGER
    )`);
  init.run();
  __db = db;

  // prettier-ignore
  const insert = db.prepare(`INSERT INTO ${table} (key, value, mtime) VALUES (?, ?, ?)`),
    // prettier-ignore
    update = db.prepare(`UPDATE ${table} SET value = ?, mtime = ? WHERE key = ?`),
    select = db.prepare(`SELECT * FROM ${table} WHERE key = ? LIMIT 1`),
    dump = db.prepare(`SELECT * FROM ${table}`),
    populate = db.transaction((obj) => {
      for (const key in obj) {
        if (select.get(key)) update.run(value, key, Date.now());
        else insert.run(key, value, Date.now());
      }
    });

  return {
    get: (key) => {
      key = key.startsWith(namespace) ? key : namespace + key;
      return select.get(key)?.value;
    },
    set: (key, value) => {
      key = key.startsWith(namespace) ? key : namespace + key;
      if (select.get(key)) return update.run(value, key, Date.now());
      else return insert.run(key, value, Date.now());
    },
    dump: () => {
      const rows = dump.all();
      let entries = rows.map(({ key, value }) => [key, value]);
      if (!namespace) return Object.fromEntries(entries);
      entries = entries.filter(([key]) => key.startsWith(`${namespace}__`));
      return Object.fromEntries(entries);
    },
    populate,
  };
};

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  platform,
  notionRequire,
  notionPath,
  enhancerRequire,
  enhancerPath,
  enhancerUrl,
  enhancerVersion,
  enhancerConfig,
  readFile,
  readJson,
  reloadApp,
  initDatabase,
});
