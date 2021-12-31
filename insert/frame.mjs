/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

(async () => {
  const api = await import('./api/index.mjs'),
    { fs, registry, web } = api;

  for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
    for (const sheet of mod.css?.frame || []) {
      web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
    }
    for (let script of mod.js?.frame || []) {
      script = await import(fs.localPath(`repo/${mod._dir}/${script}`));
      script.default(api, await registry.db(mod.id));
    }

    const errors = await registry.errors();
    if (errors.length) {
      console.error('[notion-enhancer] registry errors:');
      console.table(errors);
    }
  }
})();
