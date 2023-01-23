/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
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
  require("./api/electron.cjs");
  require("./api/mods.js");
  const { enhancerUrl } = globalThis.__enhancerApi,
    { getMods, isEnabled, modDatabase } = globalThis.__enhancerApi;

  module.exports = async (target, __exports, __eval) => {
    if (target === "main/main") require("./worker.js");

    // clientStyles
    // clientScripts
    if (target === "renderer/preload") {
      document.addEventListener("readystatechange", () => {
        if (document.readyState !== "complete") return false;
        const $script = document.createElement("script");
        $script.type = "module";
        $script.src = enhancerUrl("load.mjs");
        document.head.append($script);
      });
    }

    // electronScripts
    for (const mod of await getMods()) {
      if (!mod.electronScripts || !(await isEnabled(mod.id))) continue;
      const db = await modDatabase(mod.id);
      for (const { source, target: targetScript } of mod.electronScripts) {
        if (`${target}.js` !== targetScript) continue;
        const script = require(`notion-enhancer/${mod._src}/${source}`);
        script(globalThis.__enhancerApi, db, __exports, __eval);
      }
    }
  };

  // clientStyles
  // clientScripts
} else import("./api/browser.js").then(() => import("./load.mjs"));
