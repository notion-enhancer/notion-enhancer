/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

(async () => {
  const site = location.host.endsWith('.notion.site'),
    page = location.pathname.split(/[/-]/g).reverse()[0].length === 32,
    whitelisted = ['/', '/onboarding'].includes(location.pathname),
    signedIn = localStorage['LRU:KeyValueStore2:current-user-id'];

  if (site || page || (whitelisted && signedIn)) {
    import(chrome.runtime.getURL('api/_.mjs')).then(async (api) => {
      const { fs, registry, web } = api;
      for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
        for (const sheet of mod.css?.client || []) {
          web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
        }
        for (let script of mod.js?.client || []) {
          script = await import(fs.localPath(`repo/${mod._dir}/${script}`));
          script.default(api, await registry.db(mod.id));
        }
      }
      const errors = await registry.errors();
      if (errors.length) {
        console.log('[notion-enhancer] registry errors:');
        console.table(errors);
      }
    });
  }
})();
