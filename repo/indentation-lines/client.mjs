/*
 * notion-enhancer: indentation lines
 * (c) 2020 Alexa Baldon <alnbaldon@gmail.com> (https://github.com/runargs)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web }, db) {
  let style = 'solid',
    opacity = 1;
  switch (await db.get(['style'])) {
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

  for (const listType of ['bulleted_list', 'numbered_list', 'to_do', 'toggle']) {
    if (!(await db.get([listType]))) continue;
    document.head.append(web.html`<style>
      .notion-page-content .notion-${listType}-block > div > div:last-child::before {
        border-left: 1px ${style};
        opacity: ${opacity};
      }
    </style>`);
  }

  if (db.get(['table_of_contents'])) {
    document.head.append(web.html`<style>
      .notion-page-content .notion-table_of_contents-block > div > div > a > div
      > div:not([style*='margin-left: 0px']) > div::before {
        border-left: 1px ${style};
        opacity: ${opacity};
      }
    </style>`);
  }
}
