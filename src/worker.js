/*
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const IS_ELECTRON = typeof module !== "undefined";

if (IS_ELECTRON) {
  const { app, ipcMain } = require("electron"),
    reloadApp = () => {
      const args = process.argv.slice(1).filter((arg) => arg !== "--startup");
      app.relaunch({ args });
      app.exit();
    };

  ipcMain.on("notion-enhancer", (_event, message) => {
    if (message === "open-menu") {
      // todo
    } else if (message === "reload-app") {
      reloadApp();
    }
  });
  ipcMain.handle("notion-enhancer", (_event, message) => {
    if (message === "get-user-data-folder") {
      return app.getPath("userData");
    }
  });
} else {
  const notionUrl = "https://www.notion.so/",
    isNotionTab = (tab) => tab?.url?.startsWith(notionUrl);

  const tabQueue = new Set(),
    openEnhancerMenu = async (tab) => {
      if (!isNotionTab(tab)) {
        const openTabs = await chrome.tabs.query({
          windowId: chrome.windows.WINDOW_ID_CURRENT,
        });
        tab = openTabs.find(isNotionTab);
        tab ??= await chrome.tabs.create({ url: notionUrl });
      }
      chrome.tabs.highlight({ tabs: [tab.index] });
      if (tab.status === "complete") {
        chrome.tabs.sendMessage(tab.id, {
          channel: "notion-enhancer",
          message: "open-menu",
        });
      } else tabQueue.add(tab.id);
    },
    reloadNotionTabs = async () => {
      const openTabs = await chrome.tabs.query({
          windowId: chrome.windows.WINDOW_ID_CURRENT,
        }),
        notionTabs = openTabs.filter(isNotionTab);
      notionTabs.forEach((tab) => chrome.tabs.reload(tab.id));
    };

  // listen for invoke: https://developer.chrome.com/docs/extensions/mv3/messaging/

  chrome.action.onClicked.addListener(openEnhancerMenu);
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg?.channel !== "notion-enhancer") return;
    if (sender.tab && msg.message === "load-complete") {
      if (tabQueue.has(sender.tab.id)) {
        chrome.tabs.sendMessage(sender.tab.id, {
          channel: "notion-enhancer",
          message: "open-menu",
        });
        tabQueue.delete(sender.tab.id);
      }
    } else if (msg.message === "reload-app") {
      reloadNotionTabs();
    }
  });
}

let __db, __statements, __transactions;
const initDatabase = (namespace, fallbacks = {}) => {
  if (Array.isArray(namespace)) namespace = namespace.join("__");
  namespace = namespace ? namespace + "__" : "";
  const namespaceify = (key) =>
    key.startsWith(namespace) ? key : namespace + key;

  // schema:
  // - ("agreedToTerms") -> string: semver
  // - ("lastTelemetryPing") -> string: iso
  // - ("telemetryEnabled") -> boolean
  // - ("profileIds") -> $profileId[]
  // - ("activeProfile") -> $profileId
  // - $profileId: ("profileName") -> string
  // - $profileId__enabledMods: ($modId) -> boolean
  // - $profileId__$modId: ($optionKey) -> value

  __db ??= (async () => {
    if (!IS_ELECTRON) return;

    const table = "kvstore",
      { app } = require("electron"),
      { resolve } = require("path"),
      sqlite = require("better-sqlite3"),
      db = sqlite(resolve(`${app.getPath("userData")}/notion-enhancer.db`)),
      init = db.prepare(`CREATE TABLE IF NOT EXISTS ${table} (
        key     TEXT PRIMARY KEY,
        value   TEXT
      )`);
    init.run();

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
    async get(key) {
      await __db;
      let value;
      const fallback = fallbacks[key];
      key = namespaceify(key);
      if (IS_ELECTRON) {
        try {
          value = JSON.parse(__statements.select.get(key)?.value);
        } catch {}
      } else value = (await chrome.storage.local.get([key]))[key];
      return value ?? fallback;
    },
    async set(key, value) {
      await __db;
      key = namespaceify(key);
      return IS_ELECTRON
        ? // returns true instead of transaction completion data type
          (__transactions.set({ [key]: JSON.stringify(value) }), true)
        : chrome.storage.local.set({ [key]: value });
    },
    async remove(keys) {
      await __db;
      keys = Array.isArray(keys) ? keys : [keys];
      keys = keys.map(namespaceify);
      return IS_ELECTRON
        ? (__transactions.remove(keys), true)
        : chrome.storage.local.remove(keys);
    },
    async export() {
      await __db;
      // returns key/value pairs within scope w/out namespace
      // prefix e.g. to streamline importing from one profile and
      // then into another (where a diff. namespace is used)
      let entries = IS_ELECTRON
        ? __statements.dump.all().map(({ key, value }) => [key, value])
        : Object.entries(await chrome.storage.local.get());
      entries = entries
        .filter(([key]) => key.startsWith(namespace))
        .map(([key, value]) => [key.slice(namespace.length), value]);
      return Object.fromEntries(entries);
    },
    async import(obj) {
      await __db;
      let entries = Object.entries(obj);
      entries = entries.map(([key, value]) => [namespace + key, value]);
      entries = Object.fromEntries(entries);
      return IS_ELECTRON
        ? (__transactions.set(entries), true)
        : chrome.storage.local.set(entries);
    },
  };
};
