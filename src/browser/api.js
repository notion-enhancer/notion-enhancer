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
  reloadApp = () => chrome.runtime.sendMessage({ action: "reload" });

const initDatabase = (namespace) => {
  if (Array.isArray(namespace)) namespace = namespace.join("__");
  namespace = namespace ? namespace + "__" : "";
  return {
    get: async (key) => {
      key = key.startsWith(namespace) ? key : namespace + key;
      return new Promise((res, _rej) => {
        chrome.storage.local.get(key, (value) => res(value));
      });
    },
    set: async (key, value) => {
      key = key.startsWith(namespace) ? key : namespace + key;
      return new Promise((res, _rej) => {
        chrome.storage.local.set({ [key]: value }, () => res(value));
      });
    },
    dump: async () => {
      const obj = await new Promise((res, _rej) => {
        chrome.storage.local.get((value) => res(value));
      });
      if (!namespace) return obj;
      let entries = Object.entries(obj);
      entries = entries.filter(([key]) => key.startsWith(namespace));
      return Object.fromEntries(entries);
    },
    populate: async (obj) => {
      return new Promise((res, _rej) => {
        chrome.storage.local.set(obj, () => res(value));
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
  initDatabase,
});
