/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ web, electron }, db, __exports, __eval) {
  await web.whenReady();
  web.loadStylesheet('repo/theming/electronSearch.css');

  electron.onMessage('set-search-theme', (event, theme) => {
    for (const [key, value] of theme) {
      document.documentElement.style.setProperty(`--theme--${key}`, value);
    }
  });
};
