/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web, storage, electron }, db) {
  await web.whenReady();

  const updateTheme = async () => {
    const mode = await storage.get(['theme'], 'light');
    document.documentElement.classList.add(mode);
    document.documentElement.classList.remove(mode === 'light' ? 'dark' : 'light');
  };
  electron.onMessage('update-theme', updateTheme);
  updateTheme();
}
