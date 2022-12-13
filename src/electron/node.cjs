/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const os = require("os"),
  path = require("path"),
  electron = require("electron"),
  sqlite = require("better-sqlite3");

const notionRequire = (target) => require(`../../../${target}`),
  notionPath = (target) => path.resolve(`${__dirname}/../../../${target}`),
  notionPlatform = process.platform;

const enhancerRequire = (target) => require(`../${target}`),
  enhancerPath = (target) => path.resolve(`${__dirname}/../${target}`),
  enhancerUrl = (target) => `notion://www.notion.so/__notion-enhancer/${target}`,
  enhancerVersion = enhancerRequire("package.json").version,
  enhancerConfig = path.resolve(`${os.homedir()}/.notion-enhancer.db`);

const reloadApp = () => {
  const args = process.argv.slice(1).filter((arg) => arg !== "--startup");
  electron.app.relaunch({ args });
  electron.app.exit();
};

let __db;
const initDatabase = (table) => {
  const db = __db ?? sqlite(enhancerConfig),
    init = db.prepare(`CREATE TABLE IF NOT EXISTS ${table} (
      key     TEXT PRIMARY KEY,
      value   TEXT,
      mtime   INTEGER
    )`);
  init.run();
  __db = db;

  const insert = db.prepare(`INSERT INTO ${table} (key, value, mtime) VALUES (?, ?, ?)`),
    update = db.prepare(`UPDATE ${table} SET value = ?, mtime = ? WHERE key = ?`),
    select = db.prepare(`SELECT * FROM ${table} WHERE key = ? LIMIT 1`),
    dump = db.prepare(`SELECT * FROM ${table}`);

  return {
    get: (key) => select.get(key)?.value,
    set: (key, value) => {
      if (select.get(key)) return update.run(value, key, Date.now());
      else return insert.run(key, value, Date.now());
    },
    dump: () => dump.all(),
  };
};

module.exports = {
  notionRequire,
  notionPath,
  notionPlatform,
  enhancerRequire,
  enhancerPath,
  enhancerUrl,
  enhancerVersion,
  enhancerConfig,
  reloadApp,
  initDatabase,
};
