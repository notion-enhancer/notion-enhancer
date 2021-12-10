/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ components, env, web, fmt, fs }, db, __exports, __eval) {
  const url = require('url'),
    electron = require('electron'),
    electronWindow = electron.remote.getCurrentWindow(),
    notionIpc = env.notionRequire('helpers/notionIpc');

  let focusedTab, xIcon;
  const tabCache = new Map();
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

    $tabTitle = web.html`<span class="tab-title">v0.11.0 plan v0.11.0 plan v0.11.0 plan v0.11.0 plan</span>`;
    $closeTab = web.html`<span class="tab-close">${xIcon}</span>`;
    $tab = web.render(
      web.html`<div class="tab" draggable="true" id="${fmt.uuidv4()}"></div>`,
      this.$tabTitle,
      this.$closeTab
    );

    constructor($tabs, $root, notionUrl = 'notion://www.notion.so/') {
      this.$notion.src = notionUrl;
      tabCache.set(this.$tab.id, this);

      web.render($tabs, this.$tab);
      web.render($root, this.$search);
      web.render($root, this.$notion);
      electronWindow.on('focus', () => {
        if (focusedTab === this) this.$notion.focus();
      });

      this.$tab.addEventListener('click', (event) => {
        if (event.target !== this.$closeTab && !this.$closeTab.contains(event.target)) {
          this.focusTab();
        }
      });
      this.$closeTab.addEventListener('click', () => this.closeTab());

      this.focusTab();
      this.$tab.animate([{ width: '0px' }, { width: `${this.$tab.clientWidth}px` }], {
        duration: 100,
        easing: 'ease-in',
      }).finished;
      this.listenToNotion();
      return this;
    }

    async focusTab() {
      document.querySelectorAll('.notion-webview, .search-webview').forEach(($webview) => {
        if (![this.$notion, this.$search].includes($webview)) $webview.style.display = '';
      });
      document.querySelectorAll('.tab.current').forEach(($tab) => {
        if ($tab !== this.$tab) $tab.classList.remove('current');
      });
      this.$tab.classList.add('current');
      this.$notion.style.display = 'flex';
      this.$search.style.display = 'flex';
      this.focusNotion();
      focusedTab = this;
    }
    async closeTab() {
      const $sibling = this.$tab.nextElementSibling || this.$tab.previousElementSibling;
      if ($sibling) {
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
        if (focusedTab === this) $sibling.click();
      } else electronWindow.close();
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

    listenToNotion() {
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

      fromNotion('zoom', (zoomFactor) => {
        this.webContents().setZoomFactor(zoomFactor);
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
  }

  window['__start'] = async () => {
    const $header = web.html`<header></header>`,
      $tabs = web.html`<div id="tabs"></div>`,
      $newTab = web.html`<div class="new-tab">${await components.feather('plus')}</div>`,
      $root = document.querySelector('#root'),
      $windowActions = web.html`<div id="window-actions"></div>`;
    document.body.prepend(web.render($header, $tabs, $newTab, $windowActions));
    xIcon = await components.feather('x');

    let $draggedTab;
    const getDragTarget = ($el) => {
        while (!$el.matches('.tab, header, body')) $el = $el.parentElement;
        if ($el.matches('header')) $el = $el.firstElementChild;
        return $el.matches('#tabs, .tab') ? $el : undefined;
      },
      resetTabs = () => {
        document
          .querySelectorAll('.dragged-over')
          .forEach(($el) => $el.classList.remove('dragged-over'));
      };
    $header.addEventListener('dragstart', (event) => {
      $draggedTab = getDragTarget(event.target);
      $draggedTab.style.opacity = 0.5;
      event.dataTransfer.setData(
        'text',
        JSON.stringify({
          window: electronWindow.webContents.id,
          tab: $draggedTab.id,
          title: $draggedTab.children[0].innerText,
          url: tabCache.get($draggedTab.id).$notion.src,
        })
      );
    });
    $header.addEventListener('dragover', (event) => {
      const $target = getDragTarget(event.target);
      if ($target) {
        resetTabs();
        $target.classList.add('dragged-over');
        event.preventDefault();
      }
    });
    $header.addEventListener('dragend', (event) => {
      resetTabs();
      $draggedTab.style.opacity = '';
      $draggedTab = undefined;
    });
    document.addEventListener('drop', (event) => {
      const eventData = JSON.parse(event.dataTransfer.getData('text')),
        sameWindow = eventData.window === electronWindow.webContents.id,
        $target = getDragTarget(event.target),
        movement =
          $target &&
          (!sameWindow ||
            ($target !== $draggedTab &&
              $target !== $draggedTab.nextElementSibling &&
              ($target.matches('#tabs') ? $target.lastElementChild !== $draggedTab : true)));
      if (movement) {
        if (sameWindow) {
          if ($target.matches('#tabs')) {
            $target.append($draggedTab);
          } else $target.before($draggedTab);
        }
      }
    });

    $newTab.addEventListener('click', () => {
      new Tab($tabs, $root, url.parse(window.location.href, true).query.path);
    });
    $newTab.click();
  };
};
