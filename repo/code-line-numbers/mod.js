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
  version: '1.1.0',
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

        const resizeObserver = new ResizeObserver(
          (list, observer) => number(list[0].target)
        );

        function handle(list) {
          queue = [];
          for (let { addedNodes } of list) {
            if (
              addedNodes[0] &&
              (
                addedNodes[0].className === 'notion-page-content' ||
                (
                  addedNodes[0].querySelector &&
                  addedNodes[0].querySelector('.notion-code-block.line-numbers')
                )
              )
            ) {
              resizeObserver.disconnect();
              const codeBlocks = document.querySelectorAll('.notion-code-block.line-numbers');
              codeBlocks.forEach(block => {
                number(block);
                resizeObserver.observe(block);
              });
            }
          }
        }
        
        function number(block) {
          let codeLineNumbers = '';

          let numbers = block.querySelector('#code-line-numbers');
          if (!numbers) {
            numbers = createElement(
              '<span id="code-line-numbers"></span>'
            );
            
            const blockStyle = window.getComputedStyle(block.children[0]);
            numbers.style.top = blockStyle.paddingTop;
            numbers.style.bottom = blockStyle.paddingBottom;
            
            block.append(numbers);

            const temp = createElement('<span>A</span>');
            block.firstChild.append(temp);
            block.lineHeight = temp.getBoundingClientRect().height;
            temp.remove();
          }

          const lines = block.firstChild.innerText.split(/\r\n|\r|\n/);
          if (lines[lines.length - 1] === '') lines.pop();
          let lineCounter = 0;
          const wordWrap = block.firstChild.style.wordBreak === 'break-all';

          for (let i = 0; i < lines.length; i++) {
            lineCounter++;
            codeLineNumbers += `${lineCounter}\n`;

            if (wordWrap) {
              const temp = document.createElement('span');
              temp.innerText = lines[i];
              block.firstChild.append(temp);
              const lineHeight = temp.getBoundingClientRect().height;
              temp.remove();
              
              for (let j = 1; j < (lineHeight / block.lineHeight - 1); j++)
                codeLineNumbers += '\n';
            }
          }
          
          if (store().single_lined || codeLineNumbers.length > 2) {
            block.firstChild.classList.add('code-numbered');
            numbers.innerText = codeLineNumbers;
          } else {
            block.firstChild.classList.remove('code-numbered');
            numbers.innerText = '';
          }
        }
      });
    },
  },
};
