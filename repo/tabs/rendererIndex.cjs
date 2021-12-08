/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ env, web, fs }, db, __exports, __eval) {
  const url = require('url'),
    electron = require('electron'),
    electronWindow = electron.remote.getCurrentWindow(),
    notionIpc = env.notionRequire('helpers/notionIpc');

  class Tab {
    $notion = web.html`
      <webview class="notion-webview" partition="persist:notion"
        preload="file://${fs.notionPath('renderer/preload.js')}"
        webpreferences="spellcheck=yes, enableremotemodule=yes"
      ></webview>
    `;
    $search = web.html`
      <webview class="search-webview" partition="persist:notion"
        preload="file://${fs.notionPath('renderer/search.js')}"
        src="file:///${fs.notionPath('renderer/search.html')}"
        webpreferences="spellcheck=no, enableremotemodule=yes"
      ></webview>
    `;

    #firstQuery = true;
    constructor(notionUrl = 'notion://www.notion.so/') {
      this.navigate(notionUrl);

      this.$notion.addEventListener('dom-ready', () => {
        this.focusNotion();

        const navigateHistory = (event, cmd) => {
          const swipe = event === 'swipe',
            back = swipe ? cmd === 'left' : cmd === 'browser-backward',
            fwd = swipe ? cmd === 'right' : cmd === 'browser-forward';
          if (back && this.$notion.canGoBack()) this.$notion.goBack();
          if (fwd && this.$notion.canGoForward()) this.$notion.goForward();
        };
        electronWindow.addListener('app-command', (e, cmd) => navigateHistory('app-cmd', cmd));
        electronWindow.addListener('swipe', (e, dir) => navigateHistory('swipe', dir));

        this.webContents().addListener('found-in-page', (event, result) => {
          const matches = result
            ? { count: result.matches, index: result.activeMatchOrdinal }
            : { count: 0, index: 0 };
          notionIpc.sendIndexToSearch(this.$search, 'search:result', matches);
        });

        notionIpc.proxyAllMainToNotion(this.$notion);
      });

      notionIpc.receiveIndexFromNotion.addListener(this.$notion, 'search:start', () => {
        this.startSearch();
      });
      notionIpc.receiveIndexFromSearch.addListener(this.$search, 'search:clear', () => {
        this.clearSearch();
      });
      notionIpc.receiveIndexFromNotion.addListener(this.$notion, 'search:stop', () => {
        this.stopSearch();
      });
      notionIpc.receiveIndexFromSearch.addListener(this.$search, 'search:stop', () => {
        this.stopSearch();
      });
      notionIpc.receiveIndexFromNotion.addListener(
        this.$notion,
        'search:set-theme',
        (theme) => {
          notionIpc.sendIndexToSearch(this.$search, 'search:set-theme', theme);
        }
      );
      notionIpc.receiveIndexFromSearch.addListener(this.$search, 'search:next', (query) => {
        this.searchNext(query);
      });
      notionIpc.receiveIndexFromSearch.addListener(this.$search, 'search:prev', (query) => {
        this.searchPrev(query);
      });

      return this;
    }

    navigate(notionUrl) {
      this.$notion.src = notionUrl;
    }
    webContents() {
      return electron.remote.webContents.fromId(this.$notion.getWebContentsId());
    }
    focusNotion() {
      document.activeElement?.blur?.();
      this.$notion.blur();
      this.$notion.focus();
    }
    focusSearch() {
      document.activeElement?.blur?.();
      this.$search.blur();
      this.$search.focus();
    }

    startSearch() {
      this.$search.classList.add('search-active');
      this.focusSearch();
      notionIpc.sendIndexToSearch(this.$search, 'search:start');
      notionIpc.sendIndexToNotion(this.$search, 'search:started');
    }
    clearSearch() {
      this.#firstQuery = true;
      this.webContents().stopFindInPage('clearSelection');
    }
    stopSearch() {
      this.$search.classList.remove('search-active');
      this.focusNotion();
      this.clearSearch();
      notionIpc.sendIndexToSearch(this.$search, 'search:reset');
      notionIpc.sendIndexToNotion(this.$notion, 'search:stopped');
    }
    searchNext(query) {
      this.webContents().findInPage(query, {
        forward: true,
        findNext: !this.#firstQuery,
      });
      this.#firstQuery = false;
    }
    searchPrev(query) {
      this.webContents().findInPage(query, {
        forward: false,
        findNext: !this.#firstQuery,
      });
      this.#firstQuery = false;
    }
  }

  window['__start'] = () => {
    const tab = new Tab(url.parse(window.location.href, true).query.path);
    web.render(document.body, tab.$search);
    web.render(document.body, tab.$notion);

    electronWindow.on('focus', () => {
      tab.$notion.focus();
    });
  };
};
