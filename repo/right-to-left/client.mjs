/*
 * notion-enhancer: right to left
 * (c) 2021 obahareth <omar@omar.engineer> (https://omar.engineer)
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function ({ web }, db) {
  const pageContentSelector = `
      .notion-page-content >
        div[data-block-id]:not([dir]):not(.notion-column_list-block):not(.notion-collection_view_page-block),
      [placeholder="Untitled"]:not([dir]),
      .notion-column-block > div[data-block-id]:not([dir]),
      .notion-collection_view-block:not([dir]),
      .notion-table-view:not([dir]),
      .notion-board-view:not([dir]),
      .notion-gallery-view:not([dir])`,
    listItemSelector = `
      div[placeholder="List"]:not([style*="text-align: start"]),
      div[placeholder="To-do"]:not([style*="text-align: start"]),
      div[placeholder="Toggle"]:not([style*="text-align: start"])`,
    inlineEquationSelector =
      '.notion-text-equation-token .katex-html:not([style*="direction: rtl;"])';

  const autoAlignText = () => {
    document
      .querySelectorAll(pageContentSelector)
      .forEach(($block) => $block.setAttribute('dir', 'auto'));
    document.querySelectorAll(listItemSelector).forEach(($item) => {
      $item.style['text-align'] = 'start';
    });
    document.querySelectorAll(inlineEquationSelector).forEach(($equation) => {
      $equation.style.direction = 'rtl';
      $equation.style.display = 'inline-flex';
      $equation.style.flexDirection = 'row-reverse';
      for (const $symbol of $equation.children) {
        $symbol.style.direction = 'ltr';
      }
    });
  };
  web.addDocumentObserver(autoAlignText, [
    pageContentSelector,
    listItemSelector,
    inlineEquationSelector,
  ]);
  await web.whenReady();
  autoAlignText();
}
