/*
 * scroll-to-top
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js'),
  path = require('path'),
  fs = require('fs-extra');

module.exports = {
  id: '0a958f5a-17c5-48b5-8713-16190cae1959',
  tags: ['extension'],
  name: 'scroll to top',
  desc:
    'add an arrow above the help button to scroll back to the top of a page.',
  version: '1.0.0',
  author: 'CloudHill',
  options: [
    {
      key: 'smooth',
      label: 'smooth scrolling',
      type: 'toggle',
      value: true,
    },
    {
      key: 'top',
      label: 'distance scrolled until button is shown:',
      type: 'input',
      value: 50,
    },
    {
      key: 'unit',
      label: 'unit to measure distance with:',
      type: 'select',
      value: ['percent', 'pixels'],
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const attempt_interval = setInterval(enhance, 500);
        function enhance() {
          if (!document.querySelector('.notion-frame')) return;
          clearInterval(attempt_interval);

          const $container = document.createElement('div');
          const $help = document.querySelector('.notion-help-button');
          const $scroll = createElement(
            '<div class="notion-scroll-button" role="button"></div>'
          );
          
          (async () => {
            $scroll.innerHTML = await fs.readFile(
              path.resolve(`${__dirname}/arrow.svg`) // 🠙;
            )
          })();

          $container.className = 'bottom-right-buttons';
          $help.after($container);
          $container.append($scroll);
          $container.append($help);

          if (store().top > 0) $scroll.classList.add('hidden');

          $scroll.addEventListener('click', () => {
            document.querySelector('.notion-frame > .notion-scroller').scroll({
              top: 0,
              left: 0,
              behavior: store().smooth ? 'smooth' : 'auto',
            });
          });

          let queue = [];
          let $scroller = document.querySelector(
            '.notion-frame > .notion-scroller'
          );
          let top = store().top || 0;

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
            setScrollDistance();

            for (let { addedNodes } of list) {
              if (
                addedNodes[0] &&
                (addedNodes[0].className === 'notion-page-content' ||
                  addedNodes[0].className === 'notion-scroller') &&
                top > 0
              ) {
                $scroll.classList.add('hidden');

                $scroller = document.querySelector(
                  '.notion-frame > .notion-scroller'
                );
                setScrollDistance();

                $scroller.addEventListener('scroll', (event) => {
                  if (
                    Math.ceil(event.target.scrollTop) < $scroller.top_distance
                  )
                    $scroll.classList.add('hidden');
                  else $scroll.classList.remove('hidden');
                });
              }
            }
          }

          function setScrollDistance() {
            $scroller.top_distance = top;
            if (top > 0 && store().unit === 'percent') {
              let content_height = Array.from($scroller.children).reduce(
                (h, c) => h + c.offsetHeight,
                0
              );
              $scroller.top_distance *=
                (content_height - $scroller.offsetHeight) / 100;
            }
          }
        }
      });
    },
  },
};
