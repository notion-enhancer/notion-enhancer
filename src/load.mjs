/**
 * notion-enhancer
 * (c) 2023 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

export default (async () => {
  Object.assign((globalThis.__enhancerApi ??= {}), {
    ...(globalThis.__getEnhancerApi?.() ?? {}),
  });

  // prettier-ignore
  const { enhancerUrl, platform } = globalThis.__enhancerApi,
    signedIn = localStorage["LRU:KeyValueStore2:current-user-id"],
    pageLoaded = /(^\/$)|((-|\/)[0-9a-f]{32}((\?.+)|$))/.test(location.pathname),
    IS_MENU = location.href.startsWith(enhancerUrl("core/menu/index.html")),
    IS_TABS = /\/app\/\.webpack\/renderer\/(draggable_)?tabs\/index.html$/.test(location.href),
    IS_ELECTRON = ['linux', 'win32', 'darwin'].includes(platform),
    API_LOADED = new Promise((res, rej) => {
      const onReady = globalThis.__enhancerReady;
      globalThis.__enhancerReady = () => (onReady?.(), res());
    });
  globalThis.IS_TABS = IS_TABS;

  if (!IS_MENU && !IS_TABS) {
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
  // the dom must be re-imported

  await Promise.all([
    IS_ELECTRON || import(enhancerUrl("common/registry.js")),
    import(enhancerUrl("api/interface.mjs")),
    import(enhancerUrl("api/state.js")),
  ]);

  const { getMods, isEnabled, modDatabase } = globalThis.__enhancerApi;
  for (const mod of await getMods()) {
    if (!(await isEnabled(mod.id))) continue;
    const isCore = mod._src === "core",
      isTheme = mod._src.startsWith("themes/");
    if (IS_MENU && !(isCore || isTheme)) continue;

    // clientStyles
    for (let stylesheet of mod.clientStyles ?? []) {
      const $stylesheet = document.createElement("link");
      $stylesheet.rel = "stylesheet";
      $stylesheet.href = enhancerUrl(`${mod._src}/${stylesheet}`);
      document.head.append($stylesheet);
    }

    // clientScripts
    if (IS_MENU || IS_TABS) continue;
    const db = await modDatabase(mod.id);
    for (let script of mod.clientScripts ?? []) {
      // execute mod scripts after core has
      // loaded and api is ready to use
      Promise.resolve(isCore || API_LOADED)
        .then(() => import(enhancerUrl(`${mod._src}/${script}`)))
        .then((script) => script.default(globalThis.__enhancerApi, db))
        .then(() => !isCore || globalThis.__enhancerReady?.());
    }
  }

  if (IS_MENU || IS_TABS) globalThis.__enhancerReady?.();
  return API_LOADED.then(() => {
    if (IS_MENU) console.log("notion-enhancer: ready");
    return globalThis.__enhancerApi;
  });
})();
