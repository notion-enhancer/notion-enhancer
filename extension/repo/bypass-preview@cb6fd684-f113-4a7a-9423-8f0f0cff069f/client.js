/*
 * notion-enhancer core: bypass-preview
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { web } from '../../api.js';

web.whenReady().then(async () => {
  const openAsPage = document.querySelector(
    '.notion-peek-renderer [style*="height: 45px;"] a'
  );
  if (openAsPage) openAsPage.click();
});

function getCurrentPage() {
  const previewID = location.search
    .slice(1)
    .split('&')
    .map((opt) => opt.split('='))
    .find((opt) => opt[0] === 'p');
  if (previewID) return { type: 'preview', id: previewID[1] };
  return { type: 'page', id: location.pathname.split(/(-|\/)/g).reverse()[0] };
}
let lastPage = getCurrentPage();
web.observeDocument((event) => {
  const currentPage = getCurrentPage();
  if (currentPage.id !== lastPage.id || currentPage.type !== lastPage.type) {
    const openAsPage = document.querySelector(
      '.notion-peek-renderer [style*="height: 45px;"] a'
    );
    if (openAsPage) {
      if (currentPage.id === lastPage.id && currentPage.type === 'preview') {
        history.back();
      } else openAsPage.click();
    }
    lastPage = getCurrentPage();
  }
});
