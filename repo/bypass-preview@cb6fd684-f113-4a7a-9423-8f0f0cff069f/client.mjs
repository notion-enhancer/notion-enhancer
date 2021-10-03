/*
 * notion-enhancer: bypass-preview
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

export default async function (api, db) {
  const { web, components } = api;
  await web.whenReady();

  let _lastPage = {};
  function getCurrentPage() {
    if (web.queryParams().get('p')) return { type: 'preview', id: web.queryParams().get('p') };
    return { type: 'page', id: location.pathname.split(/(-|\/)/g).reverse()[0] };
  }

  web.addDocumentObserver((event) => {
    const currentPage = getCurrentPage();
    if (currentPage.id !== _lastPage.id || currentPage.type !== _lastPage.type) {
      const openAsPage = document.querySelector(
        '.notion-peek-renderer [style*="height: 45px;"] a'
      );
      if (openAsPage) {
        if (currentPage.id === _lastPage.id && currentPage.type === 'preview') {
          history.back();
        } else openAsPage.click();
      }
      _lastPage = getCurrentPage();
    }
  });
}
