/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

export default (async () => {
  // prettier-ignore
  const { enhancerUrl } = globalThis.__enhancerApi,
  isMenu = location.href.startsWith(enhancerUrl("/core/menu/index.html")),
  pageLoaded = /(^\/$)|((-|\/)[0-9a-f]{32}((\?.+)|$))/.test(location.pathname),
  signedIn = localStorage["LRU:KeyValueStore2:current-user-id"];
  if (!isMenu && !(signedIn && pageLoaded)) return;

  // avoid repeat logging
  if (!isMenu) console.log("notion-enhancer: loading...");

  await Promise.all([
    import("./assets/icons.svg.js"),
    import("./vendor/twind.min.js"),
    import("./vendor/lucide.min.js"),
    import("./vendor/htm.min.js"),
    import("./api/events.js"),
    import("./api/mods.js"),
  ]);
  await import("./api/interface.js");
  const { getMods, getProfile } = globalThis.__enhancerApi,
    { isEnabled, optionDefaults, initDatabase } = globalThis.__enhancerApi;

  for (const mod of await getMods()) {
    if (!(await isEnabled(mod.id))) continue;
    const isTheme = mod._src.startsWith("themes/"),
      isCore = mod._src === "core";
    if (isMenu && !(isTheme || isCore)) continue;

    // clientStyles
    for (let stylesheet of mod.clientStyles ?? []) {
      const $stylesheet = document.createElement("link");
      $stylesheet.rel = "stylesheet";
      $stylesheet.href = enhancerUrl(`${mod._src}/${stylesheet}`);
      document.head.append($stylesheet);
    }

    // clientScripts
    if (isMenu) continue;
    const options = await optionDefaults(mod.id),
      db = initDatabase([await getProfile(), mod.id], options);
    for (let script of mod.clientScripts ?? []) {
      script = await import(enhancerUrl(`${mod._src}/${script}`));
      script.default(globalThis.__enhancerApi, db);
    }
  }

  // consider "ready" after menu has loaded
  if (isMenu) console.log("notion-enhancer: ready");
})();
