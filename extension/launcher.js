/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

// only load if user is logged into notion and viewing a page
if (
  localStorage['LRU:KeyValueStore2:current-user-id'] &&
  location.pathname.split(/[/-]/g).reverse()[0].length === 32
) {
  import(chrome.runtime.getURL('api/_.mjs')).then(async (api) => {
    const { registry, storage, web } = api,
      profile = await storage.get(['currentprofile'], 'default');
    for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
      const db = storage.db(
        ['profiles', profile, mod.id],
        async (path, fallback = undefined) => {
          if (path.length === 4) {
            // profiles -> profile -> mod -> option
            fallback = (await registry.optionDefault(mod.id, path[3])) ?? fallback;
          }
          return storage.get(path, fallback);
        }
      );
      for (const sheet of mod.css?.client || []) {
        web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
      }
      for (let script of mod.js?.client || []) {
        script = await import(chrome.runtime.getURL(`repo/${mod._dir}/${script}`));
        script.default(api, db);
      }
    }
    const errors = await registry.errors();
    if (errors.length) {
      console.log('[notion-enhancer] registry errors:');
      console.table(errors);
    }
  });
}
