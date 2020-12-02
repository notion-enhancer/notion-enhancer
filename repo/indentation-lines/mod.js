/*
 * indentation lines
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 Alexa Baldon (https://github.com/runargs)
 * (c) 2020 CloudHill
 * under the MIT license
 */

'use strict';

const { createElement } = require('../../pkg/helpers.js');

module.exports = {
  id: '35815b3b-3916-4dc6-8769-c9c2448f8b57',
  tags: ['extension'],
  name: 'indentation lines',
  desc: 'adds vertical relationship lines to make list trees easier to follow.',
  version: '1.0.0',
  author: 'runargs',
  options: [
    {
      key: 'style',
      label: 'style',
      type: 'select',
      value: ['solid', 'dashed', 'dotted', 'soft'],
    },
    {
      key: 'bulleted_list',
      label: 'bulleted list',
      type: 'toggle',
      value: true,
    },
    {
      key: 'numbered_list',
      label: 'numbered list',
      type: 'toggle',
      value: true,
    },
    {
      key: 'to_do',
      label: 'to-do list',
      type: 'toggle',
      value: true,
    },
    {
      key: 'toggle',
      label: 'toggle list',
      type: 'toggle',
      value: true,
    },
  ],
  hacks: {
    'renderer/preload.js'(store, __exports) {
      document.addEventListener('readystatechange', (event) => {
        if (document.readyState !== 'complete') return false;

        const selectors = 
          ['bulleted_list', 'numbered_list', 'to_do', 'toggle']
          .filter(l => store()[l])
          .map(l => `.notion-page-content .notion-${l}-block > div > div:last-child`);
         
        let style = 'solid';
        let opacity = 1;
        switch(store().style) {
          case 'dashed':
            style = 'dashed';
            break;
          case 'dotted':
            style = 'dotted';
            break;
          case 'soft':
            opacity = 0.25;
            break;
        }

        if (selectors.length > 0) {
          document
            .querySelector('head')
            .appendChild(
              createElement(`
                <style type="text/css">
                  .notion-app-inner {
                    --indentation-lines-style: ${style};
                    --indentation-lines-opacity: ${opacity};
                  }
                  ${selectors.join(',\n')} {
                    position: relative;
                  }
                  ${selectors.join('::before,\n')}::before {
                    content: "";
                    position: absolute;
                    height: calc(100% - 2em);
                    top: 2em;
                    left: -14.48px;
                    border-left: 1px var(--indentation-lines-style);
                    opacity: var(--indentation-lines-opacity);
                  }
                </style>
              `)
            )
        }
      });
    },
  },
};
