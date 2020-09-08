/*
 * calendar scroll
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const helpers = require('../../pkg/helpers.js');

module.exports = {
  id: 'b1c7db33-dfee-489a-a76c-0dd66f7ed29a',
  tags: ['extension'],
  name: 'calendar scroll',
  desc:
    'add a button to scroll down to the current week of a calendar for you.',
  version: '0.1.0',
  author: 'dragonwocky',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        const attempt_interval = setInterval(enhance, 500);
        function enhance() {
          const notion_elem = document.querySelector('.notion-frame');
          if (!notion_elem) return;
          clearInterval(attempt_interval);

          const button = helpers.createElement(
            '<button id="calendar-scroll-to-week">Scroll</button>'
          );
          button.addEventListener('click', (event) => {
            const collection_view = document.querySelector(
              '.notion-collection-view-select'
            );
            if (!collection_view) return;
            const day = [
              ...collection_view.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
                'notion-calendar-view-day'
              ),
            ].find((day) => day.style.background);
            if (!day) return;
            const scroller = document.querySelector(
              '.notion-frame .notion-scroller'
            );
            scroller.scroll({
              top: day.offsetParent.offsetParent.offsetTop + 70,
            });
            setTimeout(
              () =>
                scroller.scroll({
                  top: day.offsetParent.offsetParent.offsetTop + 70,
                }),
              100
            );
          });

          process();
          const observer = new MutationObserver(process);
          observer.observe(notion_elem, {
            childList: true,
            subtree: true,
          });
          function process(list, observer) {
            if (document.querySelector('#calendar-scroll-to-week')) return;
            const arrow = document.querySelector(
              '.notion-selectable.notion-collection_view_page-block .chevronLeft'
            );
            if (arrow)
              arrow.parentElement.parentElement.insertBefore(
                button,
                arrow.parentElement
              );
          }
        }
      });
    },
  },
};
