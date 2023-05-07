/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const IS_ELECTRON = typeof module !== "undefined";

// expected values: 'linux', 'win32', 'darwin' (== macos), 'firefox'
// and 'chromium' (inc. chromium-based browsers like edge and brave)
// other possible values: 'aix', 'freebsd', 'openbsd', 'sunos'
const platform = IS_ELECTRON
    ? process.platform
    : navigator.userAgent.includes("Firefox")
    ? "firefox"
    : "chromium",
  // currently installed version of the notion-enhancer
  version = IS_ELECTRON
    ? require("notion-enhancer/package.json").version
    : chrome.runtime.getManifest().version,
  // forms a url to a notion-enhancer asset or source file
  // that can be accessed reliably over http
  enhancerUrl = (target) =>
    IS_ELECTRON
      ? `notion://www.notion.so/__notion-enhancer/${target.replace(/^\//, "")}`
      : chrome.runtime.getURL(target),
  // should only be used from an electron main process, does nothing elsewhere
  notionRequire = (target) => IS_ELECTRON && require(`../../../${target}`);

let __port;
const onMessage = (channel, listener) => {
    // from worker to client
    if (IS_ELECTRON) {
      const { ipcRenderer } = require("electron");
      ipcRenderer.on(channel, listener);
    } else {
      __port ??= chrome.runtime.connect();
      __port.onMessage.addListener((msg) => {
        if (msg?.channel !== channel || msg?.invocation) return;
        listener(msg.message);
      });
    }
  },
  sendMessage = (channel, message) => {
    // to worker from client
    if (IS_ELECTRON) {
      const { ipcRenderer } = require("electron");
      ipcRenderer.send(channel, message);
    } else {
      __port ??= chrome.runtime.connect();
      __port.postMessage({ channel, message });
    }
  },
  invokeInWorker = (channel, message) => {
    if (IS_ELECTRON) {
      const { ipcRenderer } = require("electron");
      return ipcRenderer.invoke(channel, message);
    } else {
      // polyfills the electron.ipcRenderer.invoke method in
      // the browser: uses a long-lived ipc connection to
      // pass messages and handle responses asynchronously
      let fulfilled;
      __port ??= chrome.runtime.connect();
      const id = crypto.randomUUID();
      return new Promise((res, rej) => {
        __port.onMessage.addListener((msg) => {
          if (msg?.invocation !== id || fulfilled) return;
          fulfilled = true;
          res(msg.message);
        });
        __port.postMessage({ channel, message, invocation: id });
      });
    }
  };

const readFile = (file) => {
    if (IS_ELECTRON) {
      // read directly from filesys if possible,
      // treating notion-enhancer/src as fs root
      if (!file.startsWith("http")) {
        const fsp = require("fs/promises"),
          { resolve } = require("path");
        return fsp.readFile(resolve(`${__dirname}/../${file}`), "utf-8");
      }
      // prefer using versions of files cached by the app
      // or routed through the notion-enhancer's url interception
      const notionProtocol = "notion://www.notion.so/";
      file = file.replace(/^https:\/\/www\.notion\.so\//, notionProtocol);
    } else file = file.startsWith("http") ? file : enhancerUrl(file);
    return fetch(file).then((res) => res.text());
  },
  readJson = (file) => {
    // as above, uses require instead of readFile
    // and res.json() instead of res.text() to return
    // json content of file in object form
    if (IS_ELECTRON) {
      if (!file.startsWith("http")) {
        const { resolve } = require("path");
        return require(resolve(`${__dirname}/../${file}`), "utf-8");
      }
      const notionProtocol = "notion://www.notion.so/";
      file = file.replace(/^https:\/\/www\.notion\.so\//, notionProtocol);
    } else file = file.startsWith("http") ? file : enhancerUrl(file);
    return fetch(file).then((res) => res.json());
  },
  reloadApp = () => {
    if (IS_ELECTRON && require("electron").app) {
      const { app } = require("electron"),
        args = process.argv.slice(1).filter((arg) => arg !== "--startup");
      app.relaunch({ args });
      app.exit();
    } else sendMessage("notion-enhancer", "reload-app");
  };

const initDatabase = (namespace, fallbacks = {}) => {
  // all db operations are performed via ipc:
  // with nodeintegration disabled, sqlite cannot
  // be require()-d from the renderer process
  const operation = (type, args = {}) =>
    invokeInWorker("notion-enhancer:db", {
      namespace,
      fallbacks,
      operation: type,
      ...args,
    });
  return {
    get: (key) => operation("get", { key }),
    set: (key, value) => operation("set", { key, value }),
    remove: (keys) => operation("remove", { keys }),
    export: () => operation("export"),
    import: (obj) => operation("import", { obj }),
  };
};

globalThis.__enhancerApi ??= {};
Object.assign(globalThis.__enhancerApi, {
  platform,
  version,
  enhancerUrl,
  notionRequire,
  onMessage,
  sendMessage,
  invokeInWorker,
  readFile,
  readJson,
  reloadApp,
  initDatabase,
});
