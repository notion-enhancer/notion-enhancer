/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const enhancerMenu = {
  _tab: {},
  highlight() {
    return new Promise((res, rej) =>
      chrome.tabs.get(this._tab.id, async (tab) => {
        if (chrome.runtime.lastError) {
          chrome.tabs.highlight({ 'tabs': (await this.create()).index });
        } else {
          chrome.tabs.highlight({ 'tabs': tab.index });
        }
        res(this._tab);
      })
    );
  },
  create() {
    return new Promise((res, rej) =>
      chrome.tabs.create(
        {
          url: chrome.runtime.getURL(
            'repo/menu@a6621988-551d-495a-97d8-3c568bca2e9e/menu.html'
          ),
        },
        (tab) => {
          this._tab = tab;
          res(this._tab);
        }
      )
    );
  },
  async open() {
    try {
      await this.highlight();
    } catch {
      await this.create();
    }
    return this._tab;
  },
};
chrome.action.onClicked.addListener(() => enhancerMenu.open());

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'enhancerMenu.open':
      enhancerMenu.open();
      break;
  }
  return true;
});
