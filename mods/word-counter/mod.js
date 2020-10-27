/*
 * word counter
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js');

module.exports = {
  id: 'b99deb52-6955-43d2-a53b-a31540cd19a5',
  tags: ['extension'],
  name: 'word counter',
  desc:
    'add page details: word/character/sentence/block count & speaking/reading times.',
  version: '0.1.0',
  author: 'dragonwocky',
  hacks: {
    'renderer/preload.js'(store, __exports) {
      const copyToClipboard = (str) => {
          const el = document.createElement('textarea');
          el.value = str;
          el.setAttribute('readonly', '');
          el.style.position = 'absolute';
          el.style.left = '-9999px';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        },
        humanTime = (mins) => {
          let readable = '';
          if (1 <= mins) {
            readable += `${Math.floor(mins)} min`;
            if (2 <= mins) readable += 's';
          }
          const secs = Math.round((mins % 1) * 60);
          if (1 <= secs) {
            if (1 <= mins) readable += ' ';
            readable += `${secs} sec`;
            if (2 <= secs) readable += 's';
          }
          return readable;
        };

      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        let queue = [],
          $page = document.getElementsByClassName('notion-page-content')[0];
        const DOCUMENT_OBSERVER = new MutationObserver((list, observer) => {
            if (!queue.length) requestIdleCallback(() => handle(queue));
            queue.push(...list);
          }),
          PAGE_OBSERVER = new MutationObserver(showPageWordDetails);
        DOCUMENT_OBSERVER.observe(document.body, {
          childList: true,
          subtree: true,
        });
        function handle(list) {
          queue = [];
          for (let { addedNodes } of list) {
            if (
              addedNodes[0] &&
              addedNodes[0].className === 'notion-page-content'
            ) {
              $page = addedNodes[0];
              showPageWordDetails();

              PAGE_OBSERVER.disconnect();
              PAGE_OBSERVER.observe($page, {
                childList: true,
                subtree: true,
                characterData: true,
              });
            }
          }
        }
        const $container = createElement(
            `<div id="word-counter-details"><div></div></div>`
          ),
          $tooltip = createElement(
            `<span id="word-counter-details-tooltip"></span>`
          );
        function showPageWordDetails() {
          const details = {
            words: $page.innerText.replace(/\s+/g, ' ').split(' ').length,
            characters: $page.innerText.length,
            sentences: $page.innerText.split('.').length,
            blocks: $page.querySelectorAll('[data-block-id]').length,
          };
          details['reading time'] = [
            humanTime(details.words / 275),
            '~275 wpm',
          ];
          details['speaking time'] = [
            humanTime(details.words / 180),
            '~180 wpm',
          ];

          $container.children[0].innerHTML = `
            <span><b>page details<br></b> (click to copy)</span>
            ${Object.keys(details).reduce(
              (prev, key) =>
                prev +
                (Array.isArray(details[key])
                  ? `<p>
                      <b>${details[key][0]}</b> ${key} 
                      <!-- from https://fontawesome.com/icons/question-circle?style=regular -->
                      <svg data-tooltip="${details[key][1]}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path
                          fill="currentColor"
                          d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003
                          248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200
                          0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200
                          200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627
                          0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579
                          0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666
                          2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112
                          261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841
                          42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z"
                        ></path>
                      </svg>
                    </p>`
                  : `<p><b>${details[key]}</b> ${key}</p>`),
              ''
            )}`;
          $page.previousElementSibling.children[0].appendChild($container);
          if (!$container.offsetParent) return;
          $container.offsetParent.appendChild($tooltip);
          $container
            .querySelectorAll('p')
            .forEach((p) =>
              p.addEventListener('click', (e) =>
                copyToClipboard(e.target.innerText)
              )
            );
          $container.querySelectorAll('[data-tooltip]').forEach((el) => {
            el.addEventListener('mouseenter', (e) => {
              $tooltip.innerText = el.getAttribute('data-tooltip');
              $tooltip.style.top = el.parentElement.offsetTop + 2.5 + 'px';
              $tooltip.style.left =
                el.parentElement.offsetLeft +
                el.parentElement.offsetWidth -
                5 +
                'px';
              $tooltip.classList.add('active');
            });
            el.addEventListener('mouseleave', (e) =>
              $tooltip.classList.remove('active')
            );
          });
        }
      });
    },
  },
};
