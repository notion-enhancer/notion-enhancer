/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ components, env, web, fs }, db, __exports, __eval) {
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

    constructor(notionUrl = 'notion://www.notion.so/') {
      this.$notion.src = notionUrl;

      const fromNotion = (channel, listener) =>
          notionIpc.receiveIndexFromNotion.addListener(this.$notion, channel, listener),
        fromSearch = (channel, listener) =>
          notionIpc.receiveIndexFromSearch.addListener(this.$search, channel, listener),
        toSearch = (channel, data) => notionIpc.sendIndexToSearch(this.$search, channel, data);

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
          toSearch('search:result', matches);
        });
      });

      notionIpc.proxyAllMainToNotion(this.$notion);
      fromNotion('search:start', () => this.startSearch());
      fromNotion('search:stop', () => this.stopSearch());
      fromNotion('search:set-theme', (theme) => toSearch('search:set-theme', theme));
      fromSearch('search:clear', () => this.clearSearch());
      fromSearch('search:stop', () => this.stopSearch());
      fromSearch('search:next', (query) => this.searchNext(query));
      fromSearch('search:prev', (query) => this.searchPrev(query));

      return this;
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

    #firstQuery = true;
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

  window['__start'] = async () => {
    const $topbar = web.html`
      <header id="tabs">
        <button class="tab current" draggable="true">
          <span class="tab-title">v0.11.0 plan</span>
          <span class="tab-close">
            ${await components.feather('x')}
          </span>
        </button>
        <button class="tab new"><span>+</span></button>
      </header>
    `;
    document.body.prepend($topbar);

    const $root = document.querySelector('#root');
    const tab = new Tab(url.parse(window.location.href, true).query.path);
    web.render($root, tab.$search);
    web.render($root, tab.$notion);
    electronWindow.on('focus', () => {
      tab.$notion.focus();
    });
  };
};
