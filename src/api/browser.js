/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const platform = navigator.userAgent.includes("Firefox")
    ? "firefox"
    : "chromium",
  version = chrome.runtime.getManifest().version,
  enhancerUrl = (target) => chrome.runtime.getURL(target);

const readFile = async (file) => {
    file = file.startsWith("http") ? file : enhancerUrl(file);
    const res = await fetch(file);
    return await res.text();
  },
  readJson = async (file) => {
    file = file.startsWith("http") ? file : enhancerUrl(file);
    const res = await fetch(file);
    return await res.json();
  },
  reloadApp = () => {
    chrome.runtime.sendMessage({
      channel: "notion-enhancer",
      message: "reload-app",
    });
  };

const sendMessage = (channel, message) => {
    chrome.runtime.sendMessage({ channel, message });
  },
  onMessage = (channel, listener) => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.channel === channel) listener(msg.message);
    });
  };

const initDatabase = (namespace, fallbacks = {}) => {
  if (Array.isArray(namespace)) namespace = namespace.join("__");
  namespace = namespace ? namespace + "__" : "";
  const namespaceify = (key) =>
    key.startsWith(namespace) ? key : namespace + key;
  return {
    get: async (key) => {
      const fallback = fallbacks[key];
      key = namespaceify(key);
      return (await chrome.storage.local.get([key]))[key] ?? fallback;
    },
    set: (key, value) => {
      key = namespaceify(key);
      return chrome.storage.local.set({ [key]: value });
    },
    remove: (keys) => {
      keys = Array.isArray(keys) ? keys : [keys];
      keys = keys.map(namespaceify);
      return chrome.storage.local.remove(keys);
    },
    export: async () => {
      const obj = await chrome.storage.local.get();
      if (!namespace) return obj;
      const entries = Object.entries(obj)
        .filter(([key]) => key.startsWith(namespace))
        .map(([key, value]) => [key.slice(namespace.length), value]);
      return Object.fromEntries(entries);
    },
    import: (obj) => {
      const entries = Object.entries(obj) //
        .map(([key, value]) => [namespace + key, value]);
      return chrome.storage.local.set(Object.fromEntries(entries));
    },
  };
};

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
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
