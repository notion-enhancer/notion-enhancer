/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const platform = "browser",
  enhancerVersion = chrome.runtime.getManifest().version,
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
  return {
    get: async (key) => {
      const fallback = fallbacks[key];
      key = key.startsWith(namespace) ? key : namespace + key;
      return new Promise((res, _rej) => {
        chrome.storage.local.get([key], ({ [key]: value }) => {
          return res(value ?? fallback);
        });
      });
    },
    set: async (key, value) => {
      key = key.startsWith(namespace) ? key : namespace + key;
      return new Promise((res, _rej) => {
        chrome.storage.local.set({ [key]: value }, () => res(true));
      });
    },
    export: async () => {
      const obj = await new Promise((res, _rej) => {
        chrome.storage.local.get((value) => res(value));
      });
      if (!namespace) return obj;
      const entries = Object.entries(obj)
        .filter(([key]) => key.startsWith(namespace))
        .map(([key, value]) => [key.slice(namespace.length), value]);
      return Object.fromEntries(entries);
    },
    import: async (obj) => {
      const entries = Object.entries(obj) //
        .map(([key, value]) => [namespace + key, value]);
      return new Promise((res, _rej) => {
        chrome.storage.local.set(Object.fromEntries(entries), () => res(true));
      });
    },
  };
};

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
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
