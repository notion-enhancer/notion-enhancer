/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import(chrome.runtime.getURL('helpers.js')).then(({ env, web, registry }) => {
  web.whenReady().then(async () => {
    for (let mod of await registry.get(
      async (mod) =>
        (await registry.enabled(mod.id)) &&
        (!mod.environments || mod.environments.includes(env.name))
    )) {
      for (let sheet of mod.css?.client || []) {
        web.loadStyleset(`repo/${mod._dir}/${sheet}`);
      }
      for (let script of mod.js?.client || []) {
        import(chrome.runtime.getURL(`repo/${mod._dir}/${script}`));
      }
    }
  });
});
