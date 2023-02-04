/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

export default (async () => {
  // prettier-ignore
  const { enhancerUrl } = globalThis.__enhancerApi,
    isMenu = location.href.startsWith(enhancerUrl("core/menu/index.html")),
    pageLoaded = /(^\/$)|((-|\/)[0-9a-f]{32}((\?.+)|$))/.test(location.pathname),
    signedIn = localStorage["LRU:KeyValueStore2:current-user-id"];
  if (!isMenu && (!signedIn || !pageLoaded)) return;
  if (!isMenu) console.log("notion-enhancer: loading...");

  await Promise.all([
    import(enhancerUrl("assets/icons.svg.js")),
    import(enhancerUrl("vendor/twind.min.js")),
    import(enhancerUrl("vendor/lucide.min.js")),
    import(enhancerUrl("vendor/htm.min.js")),
    import(enhancerUrl("api/events.js")),
    import(enhancerUrl("api/mods.js")),
  ]);
  await import(enhancerUrl("api/interface.js"));
  const { getMods, isEnabled, modDatabase } = globalThis.__enhancerApi;

  for (const mod of await getMods()) {
    if (!(await isEnabled(mod.id))) continue;
    const isTheme = mod._src.startsWith("themes/");
    if (isMenu && !(mod._src === "core" || isTheme)) continue;

    // clientStyles
    for (let stylesheet of mod.clientStyles ?? []) {
      const $stylesheet = document.createElement("link");
      $stylesheet.rel = "stylesheet";
      $stylesheet.href = enhancerUrl(`${mod._src}/${stylesheet}`);
      document.head.append($stylesheet);
    }

    // clientScripts
    if (isMenu) continue;
    const db = await modDatabase(mod.id);
    for (let script of mod.clientScripts ?? []) {
      script = await import(enhancerUrl(`${mod._src}/${script}`));
      script.default(globalThis.__enhancerApi, db);
    }
  }

  if (isMenu) console.log("notion-enhancer: ready");
})();
