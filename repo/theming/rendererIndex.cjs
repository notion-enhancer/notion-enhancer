/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ registry, web, storage }, db, __exports, __eval) {
  await web.whenReady();

  for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
    for (const sheet of mod.css?.frame || []) {
      web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
    }
  }
};
