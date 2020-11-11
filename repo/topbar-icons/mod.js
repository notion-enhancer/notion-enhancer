/*
 * topbar icons
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js'),
  path = require('path'),
  fs = require('fs-extra');

module.exports = {
  id: 'e0700ce3-a9ae-45f5-92e5-610ded0e348d',
  tags: ['extension'],
  name: 'topbar icons',
  desc:
    'replaces the topbar buttons with icons.',
  options: [
    {
      key: 'share',
      label: 'share',
      type: 'toggle',
      value: true,
    },
    {
      key: 'updates',
      label: 'updates',
      type: 'toggle',
      value: true,
    },
    {
      key: 'favorite',
      label: 'favorite',
      type: 'toggle',
      value: true,
    }, 
  ],
  version: '1.0.0',
  author: 'CloudHill',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      const icons = {
        selected: [
          ...(store().updates ? ['updates'] : []),
          ...(store().favorite ? ['favorite'] : []),
        ],
        share: fs.readFile(path.resolve(`${__dirname}/icons/share.svg`)),
        updates: {
          on: fs.readFile(path.resolve(`${__dirname}/icons/updates_on.svg`)),
          off: fs.readFile(path.resolve(`${__dirname}/icons/updates_off.svg`)),
        },
        favorite: {
          on: fs.readFile(path.resolve(`${__dirname}/icons/favorite_on.svg`)),
          off: fs.readFile(path.resolve(`${__dirname}/icons/favorite_off.svg`)),
        },
      };
      
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const attempt_interval = setInterval(enhance, 500);
        function enhance() {
          if (!document.querySelector('.notion-topbar-actions')) return;
          clearInterval(attempt_interval);

          setIcons(document.querySelector('.notion-topbar-actions'));

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
            for (let { addedNodes } of list) {
              if (
                addedNodes[0] &&
                addedNodes[0].className === 'notion-page-content' &&
                document.querySelector('.notion-peek-renderer')
              ) {
                const $topbarButtons = document.querySelector(
                  '.notion-peek-renderer .notion-topbar-share-menu'
                ).parentElement;

                if ($topbarButtons.className == 'notion-topbar-actions') return;
                $topbarButtons.className = 'notion-topbar-actions';
                setIcons($topbarButtons);
              }
            }
          }

          async function setIcons(buttons) {
            const buttonList = buttons.children;
            if (store().share) {
              buttonList[0].classList.add('notion-topbar-icon');
              buttonList[0].innerHTML = await icons.share;
            }
            const elements = {
              updates: buttonList[1],
              favorite: buttonList[2],
            };
            for (let btn of icons.selected) {
              elements[btn].classList.add('notion-topbar-icon')
              elements[btn].prepend(
                createElement(
                  `<div>${(await icons[btn].off).toString()}        
                  ${(await icons[btn].on).toString()}</div>`        
                )
              );
            }
          }
        }
      });
    },
  },
};
