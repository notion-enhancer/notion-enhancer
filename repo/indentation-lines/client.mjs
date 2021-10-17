/*
 * notion-enhancer: indentation lines
 * (c) 2020 Alexa Baldon <alnbaldon@gmail.com> (https://github.com/runargs)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web }, db) {
  let style = 'solid',
    opacity = 1,
    rainbow = false;
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
    case 'rainbow':
      opacity = 0.7;
      rainbow = true;
      break;
  }

  let css = '';
  const colors = ['red', 'pink', 'purple', 'blue', 'green', 'yellow'];
  colors.push(...colors, ...colors, ...colors, 'gray');

  for (const listType of ['bulleted_list', 'numbered_list', 'to_do', 'toggle']) {
    if (!(await db.get([listType]))) continue;
    css += `
      .notion-page-content .notion-${listType}-block > div > div:last-child::before {
        border-left: 1px ${style} var(--indentation_lines--color, currentColor);
        opacity: ${opacity};
      }`;

    if (rainbow) {
      for (let i = 0; i < colors.length; i++) {
        css += `
          .notion-page-content ${`.notion-${listType}-block `.repeat(i + 1)}
            > div > div:last-child::before {
            --indentation_lines--color: var(--theme--text_${colors[i]});
          }`;
      }
    }
  }

  if (db.get(['table_of_contents'])) {
    css += `
      .notion-page-content .notion-table_of_contents-block > div > div > a > div
        > div:not([style*='margin-left: 0px']) > div::before {
        border-left: 1px ${style} var(--indentation_lines--color, currentColor);
        opacity: ${opacity};
      }`;

    if (rainbow) {
      for (let i = 0; i < colors.length; i++) {
        css += `
          .notion-page-content ${`.notion-table_of_contents-block `.repeat(i + 1)}
            > div > div > a > div > div:not([style*='margin-left: 0px']) > div::before {
            --indentation_lines--color: var(--theme--text_${colors[i]});
          }`;
      }
    }
  }

  document.head.append(web.html`<style>${css}</style>`);
}
