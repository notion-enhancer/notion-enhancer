/*
 * right-to-left
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 Omar Bahareth
 * under the MIT license
 */

'use strict';

module.exports = {
  id: 'b28ee2b9-4d34-4e36-be8a-ab5be3d79f51',
  tags: ['extension'],
  name: 'right-to-left',
  desc: 'enables auto rtl/ltr text direction detection.',
  version: '1.3.0',
  author: 'obahareth',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const observer = new MutationObserver((list, observer) => {
          document
            .querySelectorAll(
              '.notion-page-content > div[data-block-id]:not([dir])'
            )
            .forEach((block) => block.setAttribute('dir', 'auto'));
          document
            .querySelectorAll("div[placeholder='List']")
            .forEach((item) => {
              item.style['text-align'] = 'start';
            });
        });
        observer.observe(document, {
          childList: true,
          subtree: true,
        });
      });
    },
  },
};
