/*
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const IS_ELECTRON = typeof module !== "undefined";

let __db, __statements, __transactions;
const initDatabase = async () => {
    if (!IS_ELECTRON) return chrome.storage.local;

    // schema:
    // - ("agreedToTerms") -> string: semver
    // - ("lastTelemetryPing") -> string: iso
    // - ("telemetryEnabled") -> boolean
    // - ("profileIds") -> $profileId[]
    // - ("activeProfile") -> $profileId
    // - $profileId: ("profileName") -> string
    // - $profileId__enabledMods: ($modId) -> boolean
    // - $profileId__$modId: ($optionKey) -> value

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
  },
  queryDatabase = async (namespace, query, args) => {
    namespace ??= "";
    if (Array.isArray(namespace)) namespace = namespace.join("__");
    if (namespace?.length) namespace += "__";
    const namespaceify = (key) =>
      key.startsWith(namespace) ? key : namespace + key;

    await (__db ??= initDatabase());
    switch (query) {
      case "get": {
        const key = namespaceify(args.key);
        let value;
        if (IS_ELECTRON) {
          try {
            value = JSON.parse(__statements.select.get(key)?.value);
          } catch {}
        } else value = (await chrome.storage.local.get([key]))[key];
        return value ?? args.fallbacks[args.key];
      }
      case "set": {
        const key = namespaceify(args.key),
          value = args.value;
        return IS_ELECTRON
          ? // returns true instead of transaction completion data type
            (__transactions.set({ [key]: JSON.stringify(value) }), true)
          : chrome.storage.local.set({ [key]: value });
      }
      case "remove": {
        let { keys } = args;
        if (!Array.isArray(args.keys)) keys = [keys];
        keys = keys.map(namespaceify);
        return IS_ELECTRON
          ? (__transactions.remove(keys), true)
          : chrome.storage.local.remove(keys);
      }

      case "export": {
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
      }
      case "import": {
        let entries = Object.entries(args.obj);
        entries = entries.map(([key, value]) => [namespace + key, value]);
        entries = Object.fromEntries(entries);
        return IS_ELECTRON
          ? (__transactions.set(entries), true)
          : chrome.storage.local.set(entries);
      }
    }
  };

if (IS_ELECTRON) {
  const { ipcMain } = require("electron"),
    { reloadApp } = globalThis.__enhancerApi;
  ipcMain.handle("notion-enhancer:db", ({}, message) => {
    if (message?.action !== "query-database") return;
    const { namespace, query, args } = message.data;
    return queryDatabase(namespace, query, args);
  });
  ipcMain.on("notion-enhancer", ({ sender }, message) => {
    if (message === "reload-app") reloadApp();
  });
} else {
  const notionUrl = "https://www.notion.so/",
    isNotionTab = (tab) => tab?.url?.startsWith(notionUrl);

  const tabQueue = new Set(),
    openMenu = { channel: "notion-enhancer", message: "open-menu" },
    openEnhancerMenu = async (tab) => {
      if (!isNotionTab(tab)) {
        const windowId = chrome.windows.WINDOW_ID_CURRENT,
          windowTabs = await chrome.tabs.query({ windowId });
        tab = windowTabs.find(isNotionTab);
        tab ??= await chrome.tabs.create({ url: notionUrl });
      }
      chrome.tabs.highlight({ tabs: [tab.index] });
      if (tab.status === "complete") {
        chrome.tabs.sendMessage(tab.id, openMenu);
      } else tabQueue.add(tab.id);
    },
    reloadNotionTabs = async () => {
      const windowId = chrome.windows.WINDOW_ID_CURRENT;
      (await chrome.tabs.query({ windowId }))
        .filter(isNotionTab)
        .forEach((tab) => chrome.tabs.reload(tab.id));
    };

  // listen for invoke: https://developer.chrome.com/docs/extensions/mv3/messaging/
  chrome.action.onClicked.addListener(openEnhancerMenu);
  chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg, sender) => {
      if (msg?.channel !== "notion-enhancer") return;
      const { message, invocation } = msg;
      if (message.action === "query-database") {
        const { namespace, query, args } = message.data,
          res = queryDatabase(namespace, query, args);
        if (invocation) port.postMessage({ invocation, message: res });
      }
      if (message === "load-complete") {
        if (!tabQueue.has(sender?.tab?.id)) return;
        chrome.tabs.sendMessage(sender.tab.id, openMenu);
        tabQueue.delete(sender.tab.id);
      }
      if (message === "reload-app") reloadNotionTabs();
    });
  });
}

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, { queryDatabase });
