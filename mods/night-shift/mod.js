/*
 * night shift
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

module.exports = {
  id: '9a71bbff-e87d-4a0b-8a2c-a93473113c30',
  tags: ['extension', 'theme'],
  name: 'night shift',
  desc:
    'sync dark/light theme with the system (overrides normal theme setting)',
  version: '0.1.0',
  author: 'dragonwocky',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const observer = new MutationObserver((list, observer) => {
          const mode = window.matchMedia('(prefers-color-scheme: dark)')
            .matches;
          if (
            document.querySelector(`.notion-${mode ? 'light' : 'dark'}-theme`)
          )
            document.querySelector(
              '.notion-app-inner'
            ).className = `notion-app-inner notion-${
              mode ? 'dark' : 'light'
            }-theme`;
        });
        observer.observe(document, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      });
    },
  },
};
