/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, registry, storage }, db) {
  await web.whenReady();

  const loadTheme = async () => {
    document.documentElement.className =
      (await storage.get(['theme'], 'light')) === 'dark' ? 'dark' : '';
  };
  document.addEventListener('visibilitychange', loadTheme);
  loadTheme();

  for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
    for (const sheet of mod.css?.menu || []) {
      web.loadStylesheet(`repo/${mod._dir}/${sheet}`);
    }
  }
}
