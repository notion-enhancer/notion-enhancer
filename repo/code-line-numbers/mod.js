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
              })
            }
          }
        }
        
        function number(block) {
          let codeLineNumbers = ''

          let numbers = block.querySelector('#code-line-numbers');
          if (!numbers) {
            numbers = createElement(
              '<span id="code-line-numbers"></span>'
            );
            
            const blockStyle = window.getComputedStyle(block.children[0]);
            numbers.style.top = blockStyle.paddingTop;
            numbers.style.bottom = blockStyle.paddingBottom;
            
            block.append(numbers);
          }

          const temp = createElement('<div>A</div>');
          block.children[0].append(temp);
          const lineWidth = temp.getBoundingClientRect().width;
          temp.style.display = 'inline';
          const charWidth = temp.getBoundingClientRect().width;
          temp.remove();

          let codeString = ''
          let lineCounter = 0;

          const codeSpans = block.firstChild.querySelectorAll('span');
          codeSpans.forEach(s => codeString += s.innerText)
          const lines = codeString.split(/\r\n|\r|\n/);

          for (let i = 0; i < lines.length - 1; i++) {
            lineCounter++;
            codeLineNumbers += `${lineCounter}\n`;

            const lineWrap = (lines[i].length * charWidth) / lineWidth;
            for (let j = 1; j < Math.ceil(lineWrap); j++)
              codeLineNumbers += '\n';
          }
          
          console.log(codeLineNumbers.length)
          if (store().single_lined || codeLineNumbers.length > 2) {
            block.children[0].classList.add('code-numbered');
            numbers.innerText = codeLineNumbers;
          } else {
            block.children[0].classList.remove('code-numbered');
            numbers.innerText = ''
          }
        }
      });
    },
  },
};
