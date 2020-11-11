/*
 * property layout
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 alexander-kazakov
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js');

module.exports = {
  id: '4034a578-7dd3-4633-80c6-f47ac5b7b160',
  tags: ['extension'],
  name: 'property layout',
  desc: 'auto-collapse page properties that usually push down page content.',
  version: '0.2.4',
  author: 'alexander-kazakov',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        let queue = [];
        const observer = new MutationObserver((list, observer) => {
          if (!queue.length) requestAnimationFrame(() => handle(queue));
          queue.push(...list);
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
        function handle(list) {
          queue = [];
          let properties = document.querySelector(
            '.notion-scroller.vertical [style*="env(safe-area-inset-left)"] > [style="width: 100%; font-size: 14px;"]'
          );
          if (
            properties &&
            !properties.classList.contains('propertylayout-enhanced')
          ) {
            properties.classList.add(
              'propertylayout-enhanced',
              'propertylayout-hidden'
            );
            const toggle = createElement(
              '<button class="propertylayout-toggle" data-action="show">Properties</button>'
            );
            toggle.prepend(
              createElement('<svg viewBox="0 0 100 100" class="triangle"><polygon points="5.9,88.2 50,11.8 94.1,88.2 "></polygon></svg>')
            );
            toggle.addEventListener('click', (event) => {
              properties.style.maxHeight = properties.children[0].offsetHeight + 'px';
              setTimeout(() => {
                properties.classList.toggle('propertylayout-hidden');
                toggle.setAttribute(
                  'data-action',
                  properties.classList.contains('propertylayout-hidden')
                  ? 'show'
                  : 'hide'
                );
              }, 0);
            });
            const propObserver = new MutationObserver(() => {
              properties.style.maxHeight = '';
            });
            propObserver.observe(properties, {
              childList: true,
              subtree: true,
            });
            if (properties.previousElementSibling) {
              properties.previousElementSibling.append(toggle);
            } else properties.parentElement.prepend(toggle);
          }
        }
      });
    },
  },
};
