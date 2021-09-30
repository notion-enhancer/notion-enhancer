/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

async function focusMenu() {
  const tabs = await chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }),
    url = chrome.runtime.getURL('repo/menu@a6621988-551d-495a-97d8-3c568bca2e9e/menu.html'),
    menu = tabs.find((tab) => tab.url.startsWith(url));
  if (menu) {
    chrome.tabs.highlight({ 'tabs': menu.index });
  } else chrome.tabs.create({ url });
}
chrome.action.onClicked.addListener(focusMenu);

async function focusNotion() {
  const tabs = await chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }),
    notion = tabs.find((tab) => {
      const url = new URL(tab.url),
        matches = url.host.endsWith('.notion.so') || url.host.endsWith('.notion.site');
      return matches;
    });
  if (notion) {
    chrome.tabs.highlight({ 'tabs': notion.index });
  } else chrome.tabs.create({ url: 'https://notion.so/' });
}

async function reload() {
  const tabs = await chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }),
    menu = chrome.runtime.getURL('repo/menu@a6621988-551d-495a-97d8-3c568bca2e9e/menu.html');
  tabs.forEach((tab) => {
    const url = new URL(tab.url),
      matches =
        url.host.endsWith('.notion.so') ||
        url.host.endsWith('.notion.site') ||
        tab.url.startsWith(menu);
    if (matches) chrome.tabs.reload(tab.id);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'focusMenu':
      focusMenu();
      break;
    case 'focusNotion':
      focusNotion();
      break;
    case 'reload':
      reload();
      break;
  }
  return true;
});
