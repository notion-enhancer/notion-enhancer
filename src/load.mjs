/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

export default (async () => {
  if (globalThis.__getEnhancerApi) {
    globalThis.__enhancerApi ??= {};
    Object.assign(globalThis.__enhancerApi, globalThis.__getEnhancerApi());
  }

  // prettier-ignore
  const { enhancerUrl, platform } = globalThis.__enhancerApi,
    signedIn = localStorage["LRU:KeyValueStore2:current-user-id"],
    pageLoaded = /(^\/$)|((-|\/)[0-9a-f]{32}((\?.+)|$))/.test(location.pathname),
    IS_MENU = location.href.startsWith(enhancerUrl("core/menu/index.html")),
    IS_ELECTRON = ['linux', 'win32', 'darwin'].includes(platform);

  if (!IS_MENU) {
    if (!signedIn || !pageLoaded) return;
    console.log("notion-enhancer: loading...");
  }

  // in electron, iframes cannot access node
  // => relevant functionality can be provided
  // by setting contentWindow.__enhancerApi from
  // the preload.js parent script thanks to the
  // notion:// protocol csp bypass

  // in browser, extensions run in an isolated
  // execution context => __enhancerApi modules
  // can't be passed from the parent script and
  // must be re-imported. this is fine, since
  // extension:// pages can access chrome apis

  // in both situations, modules that attach to
  // the dom must be re-imported, and should not
  // be used until import is complete, otherwise
  // their local states will be cleared (e.g.,
  // references to registered hotkeys)

  await Promise.all([
    // i.e. if (not_menu) or (is_menu && not_electron), then import
    !(!IS_MENU || !IS_ELECTRON) || import(enhancerUrl("assets/icons.svg.js")),
    import(enhancerUrl("vendor/twind.min.js")),
    import(enhancerUrl("vendor/lucide.min.js")),
    import(enhancerUrl("vendor/htm.min.js")),
  ]);
  await Promise.all([
    !(!IS_MENU || !IS_ELECTRON) || import(enhancerUrl("shared/registry.js")),
    import(enhancerUrl("shared/events.js")),
    import(enhancerUrl("shared/markup.js")),
  ]);

  const { getMods, isEnabled, modDatabase } = globalThis.__enhancerApi;
  for (const mod of await getMods()) {
    if (!(await isEnabled(mod.id))) continue;
    const isTheme = mod._src.startsWith("themes/");
    if (IS_MENU && !(mod._src === "core" || isTheme)) continue;

    // clientStyles
    for (let stylesheet of mod.clientStyles ?? []) {
      const $stylesheet = document.createElement("link");
      $stylesheet.rel = "stylesheet";
      $stylesheet.href = enhancerUrl(`${mod._src}/${stylesheet}`);
      document.head.append($stylesheet);
    }

    // clientScripts
    if (IS_MENU) continue;
    const db = await modDatabase(mod.id);
    for (let script of mod.clientScripts ?? []) {
      script = await import(enhancerUrl(`${mod._src}/${script}`));
      script.default(globalThis.__enhancerApi, db);
    }
  }

  if (IS_MENU) console.log("notion-enhancer: ready");
})();
