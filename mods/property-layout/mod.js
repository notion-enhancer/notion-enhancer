/*
 * property layout
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 alexander-kazakov
 * under the MIT license
 */

'use strict';

module.exports = {
  id: '4034a578-7dd3-4633-80c6-f47ac5b7b160',
  tags: ['extension'],
  name: 'property layout',
  desc: 'auto-collapse page properties that usually push down page content.',
  version: '0.2.1',
  author: 'alexander-kazakov',
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
        });
        function process(list) {
          queue = [];
          let properties = document.querySelector(
            '.notion-scroller.vertical > div:nth-child(2)[style="width: 100%; font-size: 14px;"]'
          );
          if (properties) {
            if (!properties.classList.contains('propertylayout-enhanced')) {
              properties.classList.add(
                'propertylayout-enhanced',
                'propertylayout-hidden'
              );
              const toggle = document.createElement('button');
              toggle.classList.add('propertylayout-toggle');
              toggle.innerText = '→ show properties';
              toggle.addEventListener('click', (event) => {
                properties.classList.toggle('propertylayout-hidden');
                toggle.innerText = `→ ${
                  properties.classList.contains('propertylayout-hidden')
                    ? 'show'
                    : 'hide'
                } properties`;
              });
              properties.previousElementSibling.append(toggle);
            }
          }
        }
      });
    },
  },
};
