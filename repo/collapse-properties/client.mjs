/*
 * notion-enhancer: collapse properties
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default function (api, db) {
  const { web, notion } = api;

  const propertyListSelector =
      '.notion-scroller.vertical [style*="env(safe-area-inset-left)"] > [style="width: 100%; font-size: 14px;"]',
    $collapseButton = web.html`<button id="enhancer--collapse-properties">
      <svg viewBox="0 0 100 100"><polygon points="5.9,88.2 50,11.8 94.1,88.2"></polygon></svg>
      <span></span>
    </button>`;
  $collapseButton.addEventListener('click', async (event) => {
    if ($collapseButton.dataset.collapsed === 'true') {
      await db.set([notion.getPageID()], false);
      $collapseButton.dataset.collapsed = false;
    } else {
      await db.set([notion.getPageID()], true);
      $collapseButton.dataset.collapsed = true;
    }
  });
  const insertButton = async () => {
    if (document.contains($collapseButton)) return;
    const $propertyList = document.querySelector(propertyListSelector);
    if ($propertyList) {
      $collapseButton.dataset.collapsed = await db.get([notion.getPageID()], false);
      $propertyList.before($collapseButton);
    }
  };
  web.addDocumentObserver(insertButton, [propertyListSelector]);
  insertButton();
}
