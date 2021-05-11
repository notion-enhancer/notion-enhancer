/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import(chrome.runtime.getURL('api.js')).then(({ web, registry }) => {
  web.whenReady().then(async () => {
    for (const mod of await registry.get((mod) => registry.isEnabled(mod.id))) {
      for (const sheet of mod.css?.client || []) {
        web.loadStyleset(`repo/${mod._dir}/${sheet}`);
      }
      for (const script of mod.js?.client || []) {
        import(chrome.runtime.getURL(`repo/${mod._dir}/${script}`));
      }
    }
  });
});
