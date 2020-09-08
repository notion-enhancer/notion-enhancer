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
  version: '0.1.0',
  author: 'dragonwocky',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const attempt_interval = setInterval(enhance, 500);
        function enhance() {
          const notion_elem = document.querySelector(
            '.notion-default-overlay-container'
          );
          if (!notion_elem) return;
          clearInterval(attempt_interval);

          process();
          const observer = new MutationObserver(process);
          observer.observe(notion_elem, {
            childList: true,
            subtree: true,
          });
          function process(list, observer) {
            let preview = document.querySelector(
              '.notion-peek-renderer [style*="height: 45px;"] a'
            );
            if (preview) preview.click();
          }
        }
      });
    },
  },
};
