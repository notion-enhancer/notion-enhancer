/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

(async () => {
  const signedIn = localStorage["LRU:KeyValueStore2:current-user-id"],
    pageLoaded = /(^\/$)|(-[0-9a-f]{32}$)/.test(location.pathname);
  if (!signedIn || !pageLoaded) return;

  const { getMods, getProfile, isEnabled, enhancerUrl, initDatabase } =
    globalThis.__enhancerApi;
  for (const mod of await getMods()) {
    if (!(await isEnabled(mod.id))) continue;

    // clientStyles
    for (let stylesheet of mod.clientStyles ?? []) {
      const $stylesheet = document.createElement("link");
      $stylesheet.rel = "stylesheet";
      $stylesheet.href = enhancerUrl(`${mod._src}/${stylesheet}`);
      document.head.appendChild($stylesheet);
    }

    // clientScripts
    for (let script of mod.clientScripts ?? []) {
      const db = initDatabase([await getProfile(), mod.id]);
      script = await import(enhancerUrl(`${mod._src}/${script}`));
      script.default(globalThis.__enhancerApi, db);
    }
  }
})();
