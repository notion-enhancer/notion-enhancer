/*
 * bypass preview
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

module.exports = {
  id: 'cb6fd684-f113-4a7a-9423-8f0f0cff069f',
  tags: ['extension'],
  name: 'bypass preview',
  desc: 'go straight to the normal full view when opening a page.',
  version: '0.1.2',
  author: 'dragonwocky',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        let queue = [];
        const observer = new MutationObserver((list, observer) => {
          if (!queue.length) requestIdleCallback(() => handle(queue));
          queue.push(...list);
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        let lastPageID;
        function handle(list) {
          queue = [];
          const pageID = (location.search
              .slice(1)
              .split('&')
              .map((opt) => opt.split('='))
              .find((opt) => opt[0] === 'p') || [
              '',
              ...location.pathname.split(/(-|\/)/g).reverse(),
            ])[1],
            preview = document.querySelector(
              '.notion-peek-renderer [style*="height: 45px;"] a'
            );
          if (!pageID) return;
          if (preview) {
            if (pageID === lastPageID) {
              history.back();
            } else preview.click();
          } else lastPageID = pageID;
        }
      });
    },
  },
};
