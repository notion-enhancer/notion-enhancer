/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, registry, storage, electron }, db) {
  await web.whenReady();

  const updateTheme = async () => {
    const mode = await storage.get(['theme'], 'light');
    document.documentElement.classList.add(mode);
    document.documentElement.classList.remove(mode === 'light' ? 'dark' : 'light');
  };
  document.addEventListener('visibilitychange', updateTheme);
  electron.onMessage('update-theme', updateTheme);
  updateTheme();

  for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
    for (const sheet of mod.css?.menu || []) {
      web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
    }
  }
}
