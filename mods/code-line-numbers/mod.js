/*
 * code line numbers
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js');

module.exports = {
  id: 'd61dc8a7-b195-465b-935f-53eea9efe74e',
  tags: ['extension'],
  name: 'code line numbers',
  desc: 'adds line numbers to code blocks.',
  version: '1.0.0',
  author: 'CloudHill',
  options: [
    {
      key: 'single_lined',
      label: 'show line numbers on single-lined code blocks',
      type: 'toggle',
      value: false,
    },
  ],
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
          for (let { addedNodes } of list) {
            if (
              addedNodes[0] &&
              addedNodes[0].dataset &&
              addedNodes[0].dataset.tokenIndex &&
              addedNodes[0].parentElement
            ) {
              const block = addedNodes[0].parentElement.parentElement;
              if (
                block &&
                block.classList &&
                block.classList.contains('notion-code-block')
              ) {
                let numbers = block.querySelector('#code-line-numbers');
                if (!numbers) {
                  numbers = createElement(
                    '<span id="code-line-numbers"></span>'
                  );

                  const blockStyle = window.getComputedStyle(block.children[0]);
                  numbers.style.top = blockStyle.paddingTop;
                  numbers.style.bottom = blockStyle.paddingBottom;

                  block.append(numbers);

                  const temp = createElement('<div>A</div>');
                  block.children[0].append(temp);
                  block.lineHeight = temp.getBoundingClientRect().height;
                  temp.remove();
                }

                const lines = Math.round(
                  numbers.getBoundingClientRect().height / block.lineHeight
                );

                if (lines > 1) {
                  block.children[0].classList.add('code-numbered');
                  numbers.innerText = Array.from(
                    Array(lines),
                    (e, i) => i + 1
                  ).join('\n');
                }
              }
            }
          }
        }
      });
    },
  },
};
