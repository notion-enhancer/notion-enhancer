/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

require("./api.cjs");
require("../common/registry.js");

module.exports = async (target, __exports, __eval) => {
  const {
    getMods,
    getProfile,
    isEnabled,
    enhancerRequire,
    enhancerUrl,
    initDatabase,
  } = globalThis.__enhancerApi;

  // clientScripts
  if (target === "renderer/preload") {
    document.addEventListener("readystatechange", (event) => {
      if (document.readyState !== "complete") return false;
      const $script = document.createElement("script");
      $script.type = "module";
      $script.src = enhancerUrl("common/loader.js");
      document.head.appendChild($script);
    });
  }

  // electronScripts
  for (const mod of await getMods()) {
    if (!mod.electronScripts || !(await isEnabled(mod.id))) continue;
    for (const { source, target: targetScript } of mod.electronScripts) {
      if (`${target}.js` !== targetScript) continue;
      const script = enhancerRequire(`${mod._src}/${source}`),
        db = initDatabase([await getProfile(), mod.id]);
      script(globalThis.__enhancerApi, db, __exports, __eval);
    }
  }
};
