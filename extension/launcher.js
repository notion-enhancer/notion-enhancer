/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import(chrome.runtime.getURL('helpers.js')).then(({ web, registry }) => {
  web.whenReady().then(async () => {
    for (let mod of await registry.get()) {
      for (let sheet of mod.css?.client || []) {
        web.loadStyleset(`repo/${mod._dir}/${sheet}`);
      }
      for (let script of mod.js?.client || []) {
        import(chrome.runtime.getURL(`repo/${mod._dir}/${script}`));
      }
    }
  });
});
