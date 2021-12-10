/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ registry, web, storage, electron }, db, __exports, __eval) {
  await web.whenReady();

  const updateTheme = async () => {
    const mode = await storage.get(['theme'], 'light');
    document.documentElement.classList.add(mode);
    document.documentElement.classList.remove(mode === 'light' ? 'dark' : 'light');
  };
  electron.onMessage('update-theme', updateTheme);
  updateTheme();

  for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
    for (const sheet of mod.css?.frame || []) {
      web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
    }
  }
};
