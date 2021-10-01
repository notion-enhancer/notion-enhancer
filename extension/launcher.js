/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

(async () => {
  if (location.pathname === '/') await new Promise((res, rej) => setTimeout(res, 500));

  const site = location.host.endsWith('.notion.site'),
    page = location.pathname.split(/[/-]/g).reverse()[0].length === 32;

  if (site || page) {
    import(chrome.runtime.getURL('api/_.mjs')).then(async ({ ...api }) => {
      const { fs, registry, web } = api,
        insert = async (mod) => {
          for (const sheet of mod.css?.client || []) {
            web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
          }
          for (let script of mod.js?.client || []) {
            script = await import(fs.localPath(`repo/${mod._dir}/${script}`));
            script.default(api, await registry.db(mod.id));
          }
          return true;
        };
      for (const mod of await registry.list((mod) => registry.core.includes(mod.id))) {
        if (mod.js?.hook) {
          let script = mod.js.hook;
          script = await import(fs.localPath(`repo/${mod._dir}/${script}`));
          api[mod.name] = await script.default(api, await registry.db(mod.id));
        }
        await insert(mod);
      }
      for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
        if (!registry.core.includes(mod.id)) await insert(mod);
      }
      const errors = await registry.errors();
      if (errors.length) {
        console.log('[notion-enhancer] registry errors:');
        console.table(errors);
      }
    });
  }
})();
