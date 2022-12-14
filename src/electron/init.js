/**
 * notion-enhancer
 * (c) 2022 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

require("./api");
require("../common/registry.js");

module.exports = async (target, __exports, __eval) => {
  // clientScripts
  if (target === "renderer/preload") {
    const { enhancerUrl } = globalThis.__enhancerApi;
    document.addEventListener("readystatechange", (event) => {
      if (document.readyState !== "complete") return false;
      const script = document.createElement("script");
      script.type = "module";
      script.src = enhancerUrl("electron/client.js");
      document.head.appendChild(script);
    });
  }

  // electronScripts
  const { getMods, getProfile, initDatabase } = globalThis.__enhancerApi;
  for (const mod of await getMods()) {
    if (!mod.electronScripts || !isEnabled(mod.id)) continue;
    for (const { source, target: targetScript } of mod.electronScripts) {
      if (`${target}.js` !== targetScript) continue;
      const script = require(`notion-enhancer/repo/${mod._dir}/${source}`),
        db = await initDatabase([await getProfile(), mod.id]);
      script(globalThis.__enhancerApi, db, __exports, __eval);
    }
  }
};
