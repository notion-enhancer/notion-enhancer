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
          const notion_elem = document.querySelector('.notion-app-inner');
          if (!notion_elem) return;
          clearInterval(attempt_interval);
          const observer = new MutationObserver(process);
          observer.observe(notion_elem, {
            childList: true,
            subtree: true,
          });

          let pageHistory = [];
          process();
          function process(list, observer) {
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
            if (
              pageID &&
              (!pageHistory[0] ||
                pageHistory[0][0] !== pageID ||
                pageHistory[0][1] !== !!preview)
            ) {
              if (preview) {
                if (
                  pageHistory[1] &&
                  pageHistory[0][0] === pageID &&
                  pageHistory[1][0] === pageID &&
                  pageHistory[1][1]
                ) {
                  document.querySelector('.notion-history-back-button').click();
                } else preview.click();
              }
              // most recent is at start for easier access
              pageHistory.unshift([pageID, !!preview]);
            }
          }
        }
      });
    },
  },
};
