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
        let queue = [];
        const observer = new MutationObserver((list, observer) => {
          if (!queue.length) requestAnimationFrame(() => process(queue));
          queue.push(...list);
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
        function process(list) {
          queue = [];
          for (let { target } of list) {
            if (!target.innerText) continue;
            if (target.getAttribute('dir') !== 'auto')
              target.setAttribute('dir', 'auto');
            if (
              getComputedStyle(target).getPropertyValue('text-align') !==
              'start'
            )
              target.style.setProperty('text-align', 'start');
          }
        }
      });
    },
  },
};
