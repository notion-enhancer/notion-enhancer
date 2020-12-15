/*
 * global linking blocks
 * (c) 2020 admiraldus (https://github.com/admiraldus)
 * under the MIT license
 */

'use strict';

const {x$} = require('./helper.js');

module.exports = {
  id: '74856af4-6970-455d-bd86-0a385a402dd1',
  name: 'global linking blocks',
  tags: ['extension'],
  desc: 'easily copy the global link of the page or the desired block.',
  version: '0.1.0',
  author: {
    name: 'admiraldus',
    link: 'https://github.com/admiraldus',
    avatar: 'https://raw.githubusercontent.com/admiraldus/admiraldus/main/module.gif',
  },
  options: [
    {
      key: 'hidePageButton',
      label: 'show the page link button',
      type: 'toggle',
      value: true,
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', () => {
        if (document.readyState !== 'complete') return false;

        /**
         * Prevent selectors from failing.
         *
         * @return  {Function}  Returns "wait()" until "main()" returns.
         */
        const wait = !function wait() {
          const els = [x$.sel('.notion-frame'), x$.sel('.notion-topbar')];
          if (els.some((el) => el !== null)) return main();
          setTimeout(() => wait(), 500);
        }();

        /**
         * Everything happens here. ¯\_(ツ)_/¯
         */
        async function main() {
          const icons = {
            globe: await x$.svg('/icons/globe.svg'),
            chain: await x$.svg('/icons/chain.svg'),
          };
          const pageClass = 'admiraldus-glb-page-button';
          const blockClass = 'admiraldus-glb-block-button';
          const spanClass = 'admiraldus-glb-span-hide';

          if (store().hidePageButton) {
            /**
             * Create the page link button and append it to the topbar.
             *
             * @return  {create}  Returns "create()" if not appended.
             */
            const pageButton = function create() {
              const target = x$.sel('.notion-topbar-share-menu');
              if (target === null) return;

              const attr = [
                `class="${pageClass}" role="button" tabindex="0"`,
                `class="${spanClass}"`,
              ];
              const html = x$.el(
                  `<div ${attr[0]}>
                    ${icons.chain}
                    <span>Copy link</span>
                    <span ${attr[1]}>Link copied!</span
                  </div>`);

              target.before(html);
              if (html === null) return create();
            };
            pageButton();

            /**
             * Observer for the topbar.
             */
            x$.obs(() => {
              if (x$.sel(`.${pageClass}`) !== null) return;
              pageButton();
            }, x$.sel('.notion-topbar'), {
              subtree: true, childList: true,
            });
          }

          /**
           * Create the block link button and append it to the block menu.
           *
           * @param   {HTMLDivElement}  el  The copy link button.
           *
           * @return  {create}              Returns "create()" if not appended.
           */
          const blockButton = function create(el) {
            const target = el;
            const attr = `class="${blockClass}" role="button" tabindex="0"`;
            const html = x$.el(
                `<div ${attr}>
                ${icons.globe}
                <span>Global link</span>
                </div>`);

            target.before(html);
            if (html === null) return create();
          };

          let buttonDelay;
          let link;
          /**
           * Copy the link to the clipboard.
           *
           * @param   {boolean}  page  If the link is the link of the page.
           */
          function copyLink(page) {
            /**
             * Change the button text to provide the copied feedback.
             */
            const changeButtonText = function create() {
              const span = x$.sel('span', true, x$.sel(`.${pageClass}`));
              /**
               * Set the classes of the button's div elements.
               *
               * @param   {number}  first   A specific array items.
               * @param   {number}  second  A specific array items.
               */
              function setClasses(first, second) {
                x$.cls.a(span[first], spanClass);
                x$.cls.r(span[second], spanClass);
              }

              clearTimeout(buttonDelay);
              setClasses(0, 1);
              buttonDelay = setTimeout(() => {
                setClasses(1, 0);
              }, 700);
            };

            switch (page) {
              case true:
                link = `https://${window.location.href}/`.replace(/notion:\/\//, '');
                changeButtonText();
                x$.clp(false, link);
                break;
              case false:
                const events = ['mousedown', 'mouseup', 'click'];
                x$.sim(events, x$.sel(`.${blockClass}`).nextSibling);
                x$.clp().then((text) => {
                  x$.clp(false, `${text.replace(/(?<=so[\/]).*#/, '')}/`);
                });
                break;
            }
          }

          /**
           * Observer for the overlay container.
           */
          x$.obs(() => {
            /**
             * Get the copy link button.
             *
             * @return  {HTMLDivElement}  Returns the copy link button.
             */
            function getLinkButton() {
              const lang = ['Copy link', '링크 복사'];
              const overlay = x$.sel('.notion-overlay-container');
              const record = x$.sel(
                  '[style*="text-overflow: ellipsis;"]', true, overlay);

              return Array.from(record).find(
                  (div) => lang.some((text) => div.textContent === text));
            }
            if (x$.sel(`.${blockClass}`) !== null ||
                x$.sel('.notion-selectable-halo') === null ||
                getLinkButton() === undefined) return;
            blockButton(getLinkButton().closest('[role="button"]'));
          }, x$.sel('.notion-overlay-container'), {
            subtree: true, childList: true,
          });

          /**
           * Listen for click events to call "copyLink()"".
           *
           * @type       {HTMLElement}
           * @listens    document.body#click
           */
          x$.on(document.body, 'click', (event) => {
            const target = event.target;

            if (x$.cls.c(target, pageClass) ||
                target.closest(`.${pageClass}`)) {
              copyLink(/* page= */ true);
            } else if (x$.cls.c(target, blockClass) ||
                target.closest(`.${blockClass}`)) {
              copyLink(/* page= */ false);
            }
          });

          /**
           * Listen for mouseenter events to add class.
           *
           * @type       {HTMLElement}
           * @listens    document.body#mouseenter
           */
          x$.on(document.body, 'mouseenter', (event) => {
            const target = event.target;

            if (x$.cls.c(target, 'admiraldus-glb-block-button')) {
              const menu = target.closest('.notion-scroller.vertical');

              x$.cls.a(menu, '--on-hover');
            }
          }, true);

          /**
           * Listen for mouseleave events to remove class.
           *
           * @type       {HTMLElement}
           * @listens    document.body#mouseleave
           */
          x$.on(document.body, 'mouseleave', (event) => {
            const target = event.target;

            if (x$.cls.c(target, 'admiraldus-glb-block-button')) {
              const menu = target.closest('.notion-scroller.vertical');

              x$.cls.r(menu, '--on-hover');
            }
          }, true);
        }
      });
    },
  },
};
