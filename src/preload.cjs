/**
 * notion-enhancer
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

// notion's renderer processes are sandboxed: preload scripts cannot
// require() files from disk. turning the sandbox off per-window is not
// reliable, as chromium may host a tab in a process it had already
// started (sandboxed) for notion's service worker. instead, this script
// is sent to the preload via ipc and provides a minimal commonjs loader
// that reads notion-enhancer sources from the main process

const { ipcRenderer } = require("electron"),
  nativeRequire = require,
  channel = "notion-enhancer:read-source",
  cache = new Map();

const normalise = (path) => {
    const segments = [];
    for (const segment of path.split("/")) {
      if (segment === "..") segments.pop();
      else if (segment && segment !== ".") segments.push(segment);
    }
    return segments.join("/");
  },
  dirname = (path) => path.split("/").slice(0, -1).join("/"),
  load = (path) => {
    if (cache.has(path)) return cache.get(path).exports;
    const source = ipcRenderer.sendSync(channel, path);
    if (typeof source !== "string") {
      throw new Error(`notion-enhancer: module not found: ${path}`);
    }
    const mod = { exports: {} };
    cache.set(path, mod);
    if (path.endsWith(".json")) mod.exports = JSON.parse(source);
    else {
      const sourceUrl = `\n//# sourceURL=notion-enhancer/${path}`,
        dir = dirname(path),
        // prettier-ignore
        args = ["require", "module", "exports", "process", "__dirname", "__filename"],
        execute = new Function(...args, source + sourceUrl);
      // `process` is not a global within sandboxed preload scripts
      execute(createRequire(dir), mod, mod.exports, process, dir, path);
    }
    return mod.exports;
  },
  createRequire = (dir) => (id) => {
    const prefix = "notion-enhancer/";
    if (id.startsWith(prefix)) return load(normalise(id.slice(prefix.length)));
    if (id.startsWith(".")) return load(normalise(`${dir}/${id}`));
    // electron and the few built-ins exposed to sandboxed preloads
    return nativeRequire(id);
  };

module.exports = load("init.js");
