/*
 * notion-enhancer: bypass-preview
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function (api, db) {
  const { web, notion } = api;
  await web.whenReady();

  let _openPage = {};
  function getCurrentPage() {
    return {
      type: web.queryParams().get('p') ? 'preview' : 'page',
      id: notion.getPageID(),
    };
  }

  web.addDocumentObserver(
    (event) => {
      const currentPage = getCurrentPage();
      if (currentPage.id !== _openPage.id || currentPage.type !== _openPage.type) {
        const openAsPage = document.querySelector(
          '.notion-peek-renderer [style*="height: 45px;"] a'
        );
        if (openAsPage) {
          if (currentPage.id === _openPage.id && currentPage.type === 'preview') {
            history.back();
          } else openAsPage.click();
        }
        _openPage = getCurrentPage();
      }
    },
    ['.notion-peek-renderer']
  );
}
