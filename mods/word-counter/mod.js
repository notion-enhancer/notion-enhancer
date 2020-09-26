/*
 * word counter
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js'),
  fs = require('fs-extra'),
  path = require('path');

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
        },
        questionBubble = fs
          .readFileSync(path.resolve(`${__dirname}/question.svg`))
          .toString();

      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;
        let queue = [],
          $page = document.getElementsByClassName('notion-page-content')[0];
        const DOCUMENT_OBSERVER = new MutationObserver((list, observer) => {
            if (!queue.length) requestIdleCallback(() => process(queue));
            queue.push(...list);
          }),
          PAGE_OBSERVER = new MutationObserver(showPageWordDetails);
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
                  ? `<p><b>${
                      details[key][0]
                    }</b> ${key} ${questionBubble.replace(
                      '<svg',
                      `<svg data-tooltip="${details[key][1]}"`
                    )}</p>`
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
