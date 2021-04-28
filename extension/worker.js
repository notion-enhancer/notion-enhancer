/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

function openEnhancerMenu() {
  chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
    const enhancerMenuURL = chrome.runtime.getURL(
        'repo/menu@a6621988-551d-495a-97d8-3c568bca2e9e/menu.html'
      ),
      enhancerMenuTab = tabs.find((tab) => tab.url.startsWith(enhancerMenuURL));
    if (enhancerMenuTab) {
      chrome.tabs.highlight({ 'tabs': enhancerMenuTab.index });
    } else chrome.tabs.create({ url: enhancerMenuURL });
  });
}
chrome.action.onClicked.addListener(openEnhancerMenu);

function focusNotion() {
  chrome.tabs.query(
    { url: 'https://*.notion.so/*', windowId: chrome.windows.WINDOW_ID_CURRENT },
    (tabs) => {
      if (tabs.length) {
        chrome.tabs.highlight({ 'tabs': tabs[0].index });
      } else chrome.tabs.create({ url: 'https://notion.so/' });
    }
  );
}

function reloadTabs() {
  chrome.tabs.query({ url: 'https://*.notion.so/*' }, (tabs) => {
    (tabs || []).forEach((tab) => chrome.tabs.reload(tab.id));
  });
  chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
    const enhancerMenuURL = chrome.runtime.getURL(
        'repo/menu@a6621988-551d-495a-97d8-3c568bca2e9e/menu.html'
      ),
      enhancerMenuTabs = (tabs || []).filter((tab) => tab.url.startsWith(enhancerMenuURL));
    enhancerMenuTabs.forEach((tab) => chrome.tabs.reload(tab.id));
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openEnhancerMenu':
      openEnhancerMenu();
      break;
    case 'focusNotion':
      focusNotion();
      break;
    case 'reloadTabs':
      reloadTabs();
      break;
  }
  return true;
});
