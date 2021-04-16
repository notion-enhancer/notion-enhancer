/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

let _enhancerMenuTab;
async function openEnhancerMenu() {
  if (!_enhancerMenuTab) {
    _enhancerMenuTab = await new Promise((res, rej) => {
      chrome.tabs.create(
        {
          url: chrome.runtime.getURL('/src/gui.html'),
        },
        res
      );
    });
  }
  chrome.tabs.highlight({ 'tabs': _enhancerMenuTab.index }, function () {});
}
chrome.action.onClicked.addListener(openEnhancerMenu);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'openEnhancerMenu':
      openEnhancerMenu();
      break;
  }
  return true;
});
