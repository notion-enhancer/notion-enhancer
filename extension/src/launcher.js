/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

import { registry, web } from './helpers.js';

export default async () => {
  web.whenReady().then(async () => {
    for (let mod of await registry) {
      for (let sheet of mod.css?.client || []) {
        web.loadStyleset(`repo/${mod.dir}/${sheet}`);
      }
      for (let script of mod.js?.client || []) {
        import(chrome.runtime.getURL(`repo/${mod.dir}/${script}`));
      }
    }
  });
};
