/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

let focusedTab;

module.exports = async function (api, db, tabCache = new Map()) {
  const { components, web, fmt, fs } = api,
    electron = require('electron'),
    electronWindow = electron.remote.getCurrentWindow(),
    notionIpc = api.electron.notionRequire('helpers/notionIpc'),
    xIcon = await components.feather('x');

  return class Tab {
    id = fmt.uuidv4();

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

    $tabIcon = web.html`<span class="tab-icon"></span>`;
    $svgIconPlaceholder = web.html`<svg viewBox="0 0 30 30">
        <g><path d="M16,1H4v28h22V11L16,1z M16,3.828L23.172,11H16V3.828z M24,27H6V3h8v10h10V27z
          M8,17h14v-2H8V17z M8,21h14v-2H8V21z M8,25h14v-2H8V25z"></path></g>
      </svg>
    `;
    $tabTitle = web.html`<span class="tab-title"></span>`;
    $closeTab = web.html`<span class="tab-close">${xIcon}</span>`;
    $tab = web.render(
      web.html`<div class="tab" draggable="true" id="${this.id}"></div>`,
      this.$tabIcon,
      this.$svgIconPlaceholder,
      this.$tabTitle,
      this.$closeTab
    );

    constructor(
      $tabList,
      $tabContainer,
      {
        notionUrl = 'notion://www.notion.so/',
        cancelAnimation = false,
        icon = '',
        title = 'notion.so',
        cache = tabCache,
      } = {}
    ) {
      this.tabCache = cache;
      this.$tabList = $tabList;
      this.$tabContainer = $tabContainer;

      this.$notion.src = notionUrl;
      this.$tabTitle.innerText = title;
      this.setIcon(icon);
      this.tabCache.set(this.$tab.id, this);

      electronWindow.on('focus', () => {
        if (focusedTab === this) this.$notion.focus();
      });
      this.$tab.addEventListener('click', (event) => {
        if (event.target !== this.$closeTab && !this.$closeTab.contains(event.target)) {
          this.focus();
        }
      });
      this.$closeTab.addEventListener('click', () => this.close());

      this.open(cancelAnimation);
      this.addNotionListeners();
      return this;
    }

    open(cancelAnimation = false) {
      this.closed = false;
      web.render(this.$tabList, this.$tab);
      web.render(this.$tabContainer, this.$search);
      web.render(this.$tabContainer, this.$notion);
      if (!cancelAnimation) {
        this.$tab.animate([{ width: '0px' }, { width: `${this.$tab.clientWidth}px` }], {
          duration: 100,
          easing: 'ease-in',
        }).finished;
      }
      this.focus();
    }
    async focus() {
      document.querySelectorAll('.notion-webview, .search-webview').forEach(($webview) => {
        if (![this.$notion, this.$search].includes($webview)) $webview.style.display = '';
      });
      document.querySelectorAll('.tab.current').forEach(($tab) => {
        if ($tab !== this.$tab) $tab.classList.remove('current');
      });
      this.$tab.classList.add('current');
      this.$notion.style.display = 'flex';
      this.$search.style.display = 'flex';
      if (this.domReady) this.focusNotion();
      focusedTab = this;
    }
    async close() {
      const $sibling = this.$tab.nextElementSibling || this.$tab.previousElementSibling;
      if ($sibling) {
        this.closed = Date.now();
        if (!focusedTab || focusedTab === this) $sibling.click();
        const width = `${this.$tab.clientWidth}px`;
        this.$tab.style.width = 0;
        this.$tab.style.pointerEvents = 'none';
        await this.$tab.animate([{ width }, { width: '0px' }], {
          duration: 100,
          easing: 'ease-out',
        }).finished;
        this.$tab.remove();
        this.$notion.remove();
        this.$search.remove();
        this.$tab.style.width = '';
        this.$tab.style.pointerEvents = '';
        this.domReady = false;
      } else electronWindow.close();
    }

    setIcon(icon) {
      if (icon.startsWith('url(')) {
        // img
        this.$tabIcon.style.background = icon;
        this.$tabIcon.innerText = '';
      } else {
        // unicode (native)
        this.$tabIcon.innerText = icon;
        this.$tabIcon.style.background = '';
      }
    }

    webContents() {
      return electron.remote.webContents.fromId(this.$notion.getWebContentsId());
    }
    focusNotion() {
      document.activeElement?.blur?.();
      this.$notion.blur();
      this.$notion.focus();
      requestAnimationFrame(() => {
        notionIpc.sendIndexToNotion(this.$notion, 'notion-enhancer:trigger-title-update');
      });
    }
    focusSearch() {
      document.activeElement?.blur?.();
      this.$search.blur();
      this.$search.focus();
    }

    domReady = false;
    addNotionListeners() {
      const fromNotion = (channel, listener) =>
          notionIpc.receiveIndexFromNotion.addListener(this.$notion, channel, listener),
        fromSearch = (channel, listener) =>
          notionIpc.receiveIndexFromSearch.addListener(this.$search, channel, listener),
        toSearch = (channel, data) => notionIpc.sendIndexToSearch(this.$search, channel, data);

      this.$notion.addEventListener('dom-ready', () => {
        if (focusedTab === this) this.focus();
        this.domReady = true;

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

      fromNotion('zoom', (zoomFactor) => {
        this.webContents().setZoomFactor(zoomFactor);
      });

      fromNotion('notion-enhancer:set-tab-title', (title) => {
        this.$tabTitle.innerText = title;
      });
      fromNotion('notion-enhancer:set-tab-icon', (icon) => this.setIcon(icon));

      fromNotion(
        'notion-enhancer:new-tab',
        () => new this.constructor(this.$tabList, this.$tabContainer)
      );
      fromNotion('notion-enhancer:close-tab', () => this.close());
      fromNotion('notion-enhancer:restore-tab', () => {
        const tab = [...this.tabCache.values()]
          .filter((tab) => tab.closed)
          .sort((a, b) => b.closed - a.closed)[0];
        if (tab) tab.open();
      });
      fromNotion('notion-enhancer:select-tab', (i) => {
        const $tab = i === 9 ? this.$tabList.lastElementChild : this.$tabList.children[i - 1];
        if ($tab) $tab.click();
      });
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
  };
};
