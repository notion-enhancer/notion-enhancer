/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ registry, web, storage, electron }, db, __exports, __eval) {
  await web.whenReady(['#search']);

  const loadTheme = async () => {
    document.documentElement.className =
      (await storage.get(['theme'], 'light')) === 'dark' ? 'dark' : '';
  };
  document.querySelector('#search').addEventListener('focus', loadTheme);
  loadTheme();

  for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
    for (const sheet of mod.css?.frame || []) {
      web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
    }
  }
};
