/**
 * notion-enhancer
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

const isElectron = () => {
  try {
    return typeof module !== "undefined";
  } catch {}
  return false;
};

if (isElectron()) {
  require("./_common/system.js");
  require("./_common/registry.js");
  const { enhancerUrl } = globalThis.__enhancerApi,
    { getMods, isEnabled, modDatabase } = globalThis.__enhancerApi;

  const mainScript = ".webpack/main/index",
    rendererScript = ".webpack/renderer/tab_browser_view/preload";

  module.exports = async (target, __exports, __eval) => {
    if (target === mainScript) require("./worker.js");
    if (target === rendererScript) {
      // expose globalThis.__enhancerApi to scripts
      const { contextBridge } = require("electron"),
        __getEnhancerApi = () => globalThis.__enhancerApi;
      contextBridge.exposeInMainWorld("__getEnhancerApi", __getEnhancerApi);

      // load clientStyles, clientScripts
      document.addEventListener("readystatechange", () => {
        if (document.readyState !== "complete") return false;
        const $script = document.createElement("script");
        $script.type = "module";
        $script.src = enhancerUrl("load.mjs");
        document.head.append($script);
      });
    }

    // load electronScripts
    for (const mod of await getMods()) {
      if (!mod.electronScripts || !(await isEnabled(mod.id))) continue;
      const db = await modDatabase(mod.id);
      for (let [scriptTarget, script] of mod.electronScripts ?? []) {
        if (target !== scriptTarget) continue;
        script = require(`./${mod._src}/${script}`);
        script(globalThis.__enhancerApi, db, __exports, __eval);
      }
    }
  };
} else {
  import(chrome.runtime.getURL("/_common/system.js")) //
    .then(() => import(chrome.runtime.getURL("/load.mjs")));
}
