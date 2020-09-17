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
  version: '1.4.0',
  author: 'obahareth',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      function alignPageContentToRight() {
        document
          .querySelectorAll(
            '.notion-page-content > div[data-block-id]:not([dir])'
          )
          .forEach((block) => block.setAttribute('dir', 'auto'));
        document
          .querySelectorAll("div[placeholder='List'], div[placeholder='To-do']")
          .forEach((item) => {
            item.style['text-align'] = '-webkit-auto';
          });
      }

      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        let queue = [];
        const DOCUMENT_OBSERVER = new MutationObserver((list, observer) => {
            if (!queue.length) requestIdleCallback(() => process(queue));
            queue.push(...list);
          }),
          PAGE_OBSERVER = new MutationObserver(alignPageContentToRight);
        DOCUMENT_OBSERVER.observe(document.body, {
          childList: true,
          subtree: true,
        });
        function process(list) {
          queue = [];
          for (let { addedNodes } of list) {
            if (
              addedNodes[0] &&
              addedNodes[0].className === 'notion-page-content'
            ) {
              alignPageContentToRight();

              const $page = document.getElementsByClassName(
                'notion-page-content'
              )[0];
              if ($page) {
                PAGE_OBSERVER.disconnect();
                PAGE_OBSERVER.observe($page, {
                  childList: true,
                  subtree: false,
                });
              }
            }
          }
        }
      });
    },
  },
};
