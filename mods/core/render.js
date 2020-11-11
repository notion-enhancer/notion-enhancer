/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const url = require('url'),
  path = require('path'),
  electron = require('electron'),
  fs = require('fs-extra'),
  {
    __notion,
    getEnhancements,
    createElement,
  } = require('../../pkg/helpers.js'),
  config = require(`${__notion}/app/config.js`),
  constants = require(`${__notion}/app/shared/constants.js`),
  notion_intl = require(`${__notion}/app/shared/notion-intl/index.js`),
  notionIpc = require(`${__notion}/app/helpers/notionIpc.js`),
  localizationHelper = require(`${__notion}/app/helpers/localizationHelper.js`),
  koMessages = require(`${__notion}/app/i18n/ko_KR/messages.json`),
  schemeHelpers = require(`${__notion}/app/shared/schemeHelpers.js`),
  React = require(`${__notion}/app/node_modules/react/index.js`),
  ReactDOM = require(`${__notion}/app/node_modules/react-dom/index.js`),
  { toKeyEvent } = require('keyboardevent-from-electron-accelerator');

const insertCSP = `
  const csp = document.createElement('meta');
  csp.httpEquiv = 'Content-Security-Policy';
  csp.content = "script-src 'self' 'unsafe-inline' 'unsafe-eval' enhancement: https://gist.github.com https://apis.google.com https://api.amplitude.com https://widget.intercom.io https://js.intercomcdn.com https://logs-01.loggly.com https://cdn.segment.com https://analytics.pgncs.notion.so https://checkout.stripe.com https://embed.typeform.com https://admin.typeform.com https://platform.twitter.com https://cdn.syndication.twimg.com; connect-src 'self' https://msgstore.www.notion.so wss://msgstore.www.notion.so https://notion-emojis.s3-us-west-2.amazonaws.com https://s3-us-west-2.amazonaws.com https://s3.us-west-2.amazonaws.com https://notion-production-snapshots-2.s3.us-west-2.amazonaws.com https: http: https://api.amplitude.com https://api.embed.ly https://js.intercomcdn.com https://api-iam.intercom.io wss://nexus-websocket-a.intercom.io https://logs-01.loggly.com https://api.segment.io https://api.pgncs.notion.so https://checkout.stripe.com https://cdn.contentful.com https://preview.contentful.com https://images.ctfassets.net https://api.unsplash.com https://boards-api.greenhouse.io; font-src 'self' data: enhancement: https: http:; img-src 'self' data: blob: https: https://platform.twitter.com https://syndication.twitter.com https://pbs.twimg.com https://ton.twimg.com; style-src 'self' 'unsafe-inline' enhancement: https: http:; frame-src https: http:; media-src https: http:";
  document.head.appendChild(csp);
`,
  idToNotionURL = (id) =>
    `notion://www.notion.so/${
      url.parse(id).pathname.split('/').reverse()[0] || ''
    }/${url.parse(id).search || ''}`;

module.exports = (store, __exports) => {
  if ((store('mods')['e1692c29-475e-437b-b7ff-3eee872e1a42'] || {}).enabled) {
    class Index extends React.PureComponent {
      constructor() {
        super(...arguments);
        this.state = {
          error: false,
          searching: false,
          searchingPeekView: false,
          zoomFactor: 1,
          tabs: new Map([[0, { title: 'notion.so', open: true }]]),
          slideIn: new Set(),
          slideOut: new Set(),
        };
        this.$titlebar = null;
        this.$dragging = null;
        this.views = {
          active: null,
          current: {
            $el: () => this.views.html[this.views.current.id],
            id: 0,
          },
          react: {},
          html: {},
          loaded: {},
          tabs: {},
        };
        this.$search = null;
        this.handleReload = () => {
          this.setState({ error: false });
          Object.values(this.views.html).forEach(($notion) => {
            if ($notion.isWaitingForResponse()) $notion.reload();
          });
        };
        this.communicateWithView = this.communicateWithView.bind(this);
        this.startSearch = this.startSearch.bind(this);
        this.stopSearch = this.stopSearch.bind(this);
        this.nextSearch = this.nextSearch.bind(this);
        this.prevSearch = this.prevSearch.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.doneSearch = this.doneSearch.bind(this);

        // draggable re-ordering
        const getTab = ($el) => {
          if ($el.tagName !== 'BUTTON') $el = $el.parentElement;
          if ($el.innerText === '+')
            return [null, document.querySelector('.tab.new')];
          const tab = Object.entries(this.views.tabs).find(
            ([id, $node]) => $node === $el
          );
          return tab ? [+tab[0], tab[1]] : [];
        };
        document.addEventListener('dragstart', (event) => {
          if (!this.$titlebar) return;
          const tab = getTab(event.target);
          this.$dragging = tab[0];
          event.dataTransfer.setData(
            'text',
            JSON.stringify({
              target: electron.remote.getCurrentWindow().webContents.id,
              tab: tab[0],
              title: tab[1].children[0].innerText,
              url: document.getElementById(getTab(event.target)[0]).src,
            })
          );
          event.target.style.opacity = 0.5;
        });
        document.addEventListener('dragend', (event) => {
          if (!this.$titlebar) return;
          event.target.style.opacity = '';
          document
            .querySelectorAll('.dragged-over')
            .forEach((el) => el.classList.remove('dragged-over'));
        });
        document.addEventListener('dragover', (event) => {
          if (!this.$titlebar) return;
          event.preventDefault();
          document
            .querySelectorAll('.dragged-over')
            .forEach((el) => el.classList.remove('dragged-over'));
          const tab = getTab(event.target)[1];
          if (tab) tab.classList.add('dragged-over');
        });
        document.addEventListener('drop', async (event) => {
          event.preventDefault();
          const eventData = JSON.parse(event.dataTransfer.getData('text'));
          if (
            eventData.target !==
            electron.remote.getCurrentWindow().webContents.id
          ) {
            electron.ipcRenderer.send(
              'enhancer:close-tab',
              eventData.target,
              eventData.tab
            );
            this.$dragging = await this.newTab(
              eventData.url,
              eventData.title,
              false
            );
          }
          if (this.$titlebar) {
            const from = getTab(this.views.tabs[+this.$dragging]),
              to = getTab(event.target);
            if (from[0] !== to[0]) {
              if (to[1].classList.contains('new')) {
                const list = new Map(this.state.tabs);
                list.delete(from[0]);
                list.set(from[0], this.state.tabs.get(from[0]));
                this.setState({ tabs: list });
              } else {
                const list = [...this.state.tabs],
                  fromIndex = list.findIndex(
                    ([id, { title, open }]) => id === from[0]
                  ),
                  toIndex = list.findIndex(
                    ([id, { title, open }]) => id === to[0]
                  );
                list.splice(
                  toIndex > fromIndex ? toIndex - 1 : toIndex,
                  0,
                  list.splice(fromIndex, 1)[0]
                );
                this.setState({ tabs: new Map(list) });
              }
            }
            this.$dragging = null;
          }
        });
        electron.ipcRenderer.on('enhancer:close-tab', (event, tab) => {
          this.closeTab(tab);
        });
      }

      componentDidMount() {
        const buttons = require('./buttons.js')(store);
        this.$titlebar.appendChild(buttons.element);
        this.loadListeners();

        let electronWindow;
        try {
          electronWindow = electron.remote.getCurrentWindow();
        } catch (error) {
          notionIpc.sendToMain('notion:log-error', {
            level: 'error',
            from: 'index',
            type: 'GetCurrentWindowError',
            error: error.message,
          });
        }
        if (!electronWindow) {
          this.setState({ error: true });
          this.handleReload();
          return;
        }
        electronWindow.addListener('app-command', (e, cmd) => {
          const webContents = this.views.current.$el().getWebContents();
          if (cmd === 'browser-backward' && webContents.canGoBack()) {
            webContents.goBack();
          } else if (cmd === 'browser-forward' && webContents.canGoForward()) {
            webContents.goForward();
          }
        });
        electronWindow.addListener('swipe', (e, dir) => {
          const webContents = this.views.current.$el().getWebContents();
          if (dir === 'left' && webContents.canGoBack()) {
            webContents.goBack();
          } else if (dir === 'right' && webContents.canGoForward()) {
            webContents.goForward();
          }
        });
        electronWindow.addListener('focus', (e) => {
          this.views.current.$el().focus();
        });
      }

      newTab(url = '', title = 'notion.so', animate = true) {
        let id = 0;
        const list = new Map(this.state.tabs);
        while (this.state.tabs.get(id) && this.state.tabs.get(id).open) id++;
        list.delete(id);
        return this.openTab(id, {
          state: list,
          load: url || true,
          title,
          animate,
        });
      }
      openTab(
        id,
        {
          state = new Map(this.state.tabs),
          slideOut = new Set(this.state.slideOut),
          load,
          animate,
          title = 'notion.so',
        } = {
          state: new Map(this.state.tabs),
          slideOut: new Set(this.state.slideOut),
          load: false,
          title: 'notion.so',
          animate: false,
        }
      ) {
        return new Promise((res, rej) => {
          if (!id && id !== 0) {
            if (state.get(this.views.current.id).open) return res(id);
            const currentIndex = [...state].findIndex(
              ([id, { title, open }]) => id === this.views.current.id
            );
            id = ([...state].find(
              ([id, { title, open }], tabIndex) =>
                open && tabIndex > currentIndex
            ) || [...state].find(([id, { title, open }]) => open))[0];
          }
          const current_src = this.views.current.$el().src;
          this.views.current.id = id;
          this.setState(
            {
              tabs: state.set(id, {
                title: state.get(id) ? state.get(id).title : title,
                open: true,
              }),
              slideIn: animate
                ? this.state.slideIn.add(id)
                : this.state.slideIn,
              slideOut: slideOut,
            },
            async () => {
              this.focusTab();
              new Promise((resolve, reject) => {
                let attempt,
                  clear = () => {
                    clearInterval(attempt);
                    return true;
                  };
                attempt = setInterval(() => {
                  if (this.views.current.id !== id) return clear() && reject();
                  if (document.body.contains(this.views.html[id]))
                    return clear() && resolve();
                }, 50);
              })
                .then(() => {
                  if (load) {
                    this.views.html[id].style.opacity = '0';
                    let unhide;
                    unhide = () => {
                      this.views.html[id].style.opacity = '';
                      this.views.html[id].removeEventListener(
                        'did-stop-loading',
                        unhide
                      );
                    };
                    this.views.html[id].addEventListener(
                      'did-stop-loading',
                      unhide
                    );
                    this.views.html[id].loadURL(
                      typeof load === 'string'
                        ? load
                        : store().default_page
                        ? idToNotionURL(store().default_page)
                        : current_src
                    );
                  }
                })
                .catch(() => {
                  // nothing
                })
                .finally(() => {
                  setTimeout(() => {
                    this.setState(
                      { slideIn: new Set(), slideOut: new Set() },
                      () => res(id)
                    );
                  }, 150);
                });
            }
          );
        });
      }
      closeTab(id) {
        if ((!id && id !== 0) || !this.state.tabs.get(id)) return;
        const list = new Map(this.state.tabs);
        list.set(id, { ...list.get(id), open: false });
        if (![...list].filter(([id, { title, open }]) => open).length)
          return electron.remote.getCurrentWindow().close();
        return this.openTab(
          this.views.current.id === id ? null : this.views.current.id,
          { state: list, slideOut: this.state.slideOut.add(id) }
        );
      }
      focusTab() {
        if (this.views.active === this.views.current.id) return;
        this.loadListeners();
        this.blurListeners();
        this.focusListeners();
        for (const id in this.views.loaded) {
          if (this.views.loaded.hasOwnProperty(id) && this.views.loaded[id]) {
            const selected =
              id == this.views.current.id &&
              this.state.tabs.get(+id) &&
              this.state.tabs.get(+id).open;
            this.views.loaded[id].style.display = selected ? 'flex' : 'none';
            if (selected) {
              this.views.active = +id;
              this.views.loaded[id].focus();
              const electronWindow = electron.remote.getCurrentWindow(),
                title =
                  (this.state.tabs.get(+id).emoji
                    ? `${this.state.tabs.get(+id).emoji} `
                    : '') + (this.state.tabs.get(+id).text || 'Notion Desktop');
              if (electronWindow && electronWindow.getTitle() !== title)
                electronWindow.setTitle(title);
            }
          }
        }
      }
      selectTab(num) {
        if (num === 'ArrowLeft') {
          const prev = document.querySelector('.tab.current')
            .previousElementSibling;
          if (prev) prev.click();
        } else if (num === 'ArrowRight') {
          const next = document.querySelector('.tab.current')
            .nextElementSibling;
          if (next && !next.classList.contains('new')) next.click();
        } else {
          num = +num;
          if (num == 9) {
            document
              .querySelector('#tabs')
              .children[
                document.querySelector('#tabs').children.length - 2
              ].click();
          } else if (
            document.querySelector('#tabs').children[num - 1] &&
            document.querySelector('#tabs').children.length > num
          ) {
            document.querySelector('#tabs').children[num - 1].click();
          }
        }
      }

      communicateWithView(event) {
        switch (event.channel) {
          case 'enhancer:set-tab-title':
            if (this.state.tabs.get(+event.target.id)) {
              this.setState({
                tabs: new Map(
                  this.state.tabs.set(+event.target.id, {
                    ...this.state.tabs.get(+event.target.id),
                    title: event.args[0],
                  })
                ),
              });
              const electronWindow = electron.remote.getCurrentWindow(),
                title =
                  (event.args[0].emoji ? `${event.args[0].emoji} ` : '') +
                  (event.args[0].text || 'Notion Desktop');
              if (
                event.target.id == this.views.current.id &&
                electronWindow.getTitle() !== title
              )
                electronWindow.setTitle(title);
            }
            break;
          case 'enhancer:select-tab':
            this.selectTab(event.args[0]);
            break;
          case 'enhancer:new-tab':
            this.newTab(event.args[0]);
            break;
          case 'enhancer:close-tab':
            this.closeTab(
              event.args[0] || event.args[0] === 0
                ? event.args[0]
                : this.views.current.id
            );
            break;
        }
      }
      startSearch(isPeekView) {
        this.setState(
          {
            searching: true,
            searchingPeekView: isPeekView,
          },
          () => {
            if (document.activeElement instanceof HTMLElement)
              document.activeElement.blur();
            this.$search.focus();
            notionIpc.sendIndexToSearch(this.$search, 'search:start');
            notionIpc.sendIndexToNotion(this.$search, 'search:started');
          }
        );
      }
      stopSearch() {
        notionIpc.sendIndexToSearch(this.$search, 'search:reset');
        this.setState({
          searching: false,
        });
        this.lastSearchQuery = undefined;
        this.views.current
          .$el()
          .getWebContents()
          .stopFindInPage('clearSelection');
        notionIpc.sendIndexToNotion(this.views.current.$el(), 'search:stopped');
      }
      nextSearch(query) {
        this.views.current
          .$el()
          .getWebContents()
          .findInPage(query, {
            forward: true,
            findNext: query === this.lastSearchQuery,
          });
        this.lastSearchQuery = query;
      }
      prevSearch(query) {
        this.views.current
          .$el()
          .getWebContents()
          .findInPage(query, {
            forward: false,
            findNext: query === this.lastSearchQuery,
          });
        this.lastSearchQuery = query;
      }
      clearSearch() {
        this.lastSearchQuery = undefined;
        this.views.current
          .$el()
          .getWebContents()
          .stopFindInPage('clearSelection');
      }
      doneSearch() {
        this.lastSearchQuery = undefined;
        this.views.current
          .$el()
          .getWebContents()
          .stopFindInPage('clearSelection');
        this.setState({ searching: false });
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        this.views.current.$el().focus();
        notionIpc.sendIndexToNotion(this.views.current.$el(), 'search:stopped');
      }
      focusListeners() {
        if (!this.views.current.$el() || !this.$search) return;
        this.views.current
          .$el()
          .addEventListener('ipc-message', this.communicateWithView);
        notionIpc.receiveIndexFromNotion.addListener(
          this.views.current.$el(),
          'search:start',
          this.startSearch
        );
        notionIpc.receiveIndexFromNotion.addListener(
          this.views.current.$el(),
          'search:stop',
          this.stopSearch
        );
        notionIpc.receiveIndexFromSearch.addListener(
          this.$search,
          'search:next',
          this.nextSearch
        );
        notionIpc.receiveIndexFromSearch.addListener(
          this.$search,
          'search:prev',
          this.prevSearch
        );
        notionIpc.receiveIndexFromSearch.addListener(
          this.$search,
          'search:clear',
          this.clearSearch
        );
        notionIpc.receiveIndexFromSearch.addListener(
          this.$search,
          'search:stop',
          this.doneSearch
        );
      }
      blurListeners() {
        if (!this.views.current.$el() || !this.$search) return;
        if (this.state.searching) this.stopSearch();
        this.views.current
          .$el()
          .removeEventListener('ipc-message', this.communicateWithView);
        notionIpc.receiveIndexFromNotion.removeListener(
          this.views.current.$el(),
          'search:start',
          this.startSearch
        );
        notionIpc.receiveIndexFromNotion.removeListener(
          this.views.current.$el(),
          'search:stop',
          this.stopSearch
        );
        notionIpc.receiveIndexFromSearch.removeListener(
          this.$search,
          'search:next',
          this.nextSearch
        );
        notionIpc.receiveIndexFromSearch.removeListener(
          this.$search,
          'search:prev',
          this.prevSearch
        );
        notionIpc.receiveIndexFromSearch.removeListener(
          this.$search,
          'search:clear',
          this.clearSearch
        );
        notionIpc.receiveIndexFromSearch.removeListener(
          this.$search,
          'search:stop',
          this.doneSearch
        );
      }
      loadListeners() {
        if (!this.$search) return;
        Object.entries(this.views.html)
          .filter(([id, $notion]) => !this.views.loaded[id] && $notion)
          .forEach(([id, $notion]) => {
            if (!$notion) return;
            this.views.loaded[id] = $notion;
            $notion.addEventListener('did-fail-load', (error) => {
              // logger.info('Failed to load:', error);
              if (
                error.errorCode === -3 ||
                !error.validatedURL.startsWith(
                  schemeHelpers.getSchemeUrl({
                    httpUrl: config.default.baseURL,
                    protocol: config.default.protocol,
                  })
                )
              ) {
                return;
              }
              this.setState({ error: true });
            });
            $notion.addEventListener('dom-ready', () => {
              $notion.getWebContents().executeJavaScript(insertCSP);
              $notion
                .getWebContents()
                .addListener('found-in-page', (event, result) => {
                  const matches = result
                    ? {
                        count: result.matches,
                        index: result.activeMatchOrdinal,
                      }
                    : { count: 0, index: 0 };
                  notionIpc.sendIndexToSearch(
                    this.$search,
                    'search:result',
                    matches
                  );
                });
              notionIpc.proxyAllMainToNotion($notion);
            });
            notionIpc.receiveIndexFromNotion.addListener(
              $notion,
              'search:set-theme',
              (theme) => {
                notionIpc.sendIndexToSearch(
                  this.$search,
                  'search:set-theme',
                  theme
                );
              }
            );
            notionIpc.receiveIndexFromNotion.addListener(
              $notion,
              'zoom',
              (zoomFactor) => {
                $notion.getWebContents().setZoomFactor(zoomFactor);
                this.$search.getWebContents().setZoomFactor(zoomFactor);
                this.setState({ zoomFactor });
              }
            );
            let electronWindow;
            try {
              electronWindow = electron.remote.getCurrentWindow();
            } catch (error) {
              notionIpc.sendToMain('notion:log-error', {
                level: 'error',
                from: 'index',
                type: 'GetCurrentWindowError',
                error: error.message,
              });
            }
            if (!electronWindow) {
              this.setState({ error: true });
              this.handleReload();
              return;
            }
            const sendFullScreenChangeEvent = () => {
              notionIpc.sendIndexToNotion(
                $notion,
                'notion:full-screen-changed'
              );
            };
            electronWindow.addListener(
              'enter-full-screen',
              sendFullScreenChangeEvent
            );
            electronWindow.addListener(
              'leave-full-screen',
              sendFullScreenChangeEvent
            );
            electronWindow.addListener(
              'enter-html-full-screen',
              sendFullScreenChangeEvent
            );
            electronWindow.addListener(
              'leave-html-full-screen',
              sendFullScreenChangeEvent
            );
          });
      }

      renderTitlebar() {
        return React.createElement(
          'header',
          {
            id: 'titlebar',
            ref: ($titlebar) => {
              this.$titlebar = $titlebar;
            },
            onClick: (e) => {
              this.views.current.$el().focus();
            },
          },
          React.createElement('button', {
            id: 'open-enhancer-menu',
            onClick: (e) => {
              electron.ipcRenderer.send('enhancer:open-menu');
            },
          }),
          React.createElement(
            'div',
            { id: 'tabs' },
            ...[...this.state.tabs]
              .filter(
                ([id, { title, open }]) => open || this.state.slideOut.has(id)
              )
              .map(([id, { title, open }]) =>
                React.createElement(
                  'button',
                  {
                    className:
                      'tab' +
                      (id === this.views.current.id ? ' current' : '') +
                      (this.state.slideIn.has(id) ? ' slideIn' : '') +
                      (this.state.slideOut.has(id) ? ' slideOut' : ''),
                    draggable: true,
                    onClick: (e) => {
                      if (!e.target.classList.contains('close'))
                        this.openTab(id);
                    },
                    onMouseUp: (e) => {
                      if (window.event.which === 2) this.closeTab(id);
                    },
                    ref: ($tab) => {
                      this.views.tabs[id] = $tab;
                    },
                  },
                  React.createElement('span', {
                    dangerouslySetInnerHTML: {
                      __html: (title.img || '') + (title.text || 'notion.so'),
                    },
                  }),
                  React.createElement(
                    'span',
                    {
                      className: 'close',
                      onClick: () => {
                        this.closeTab(id);
                      },
                    },
                    '×'
                  )
                )
              ),
            React.createElement(
              'button',
              {
                className: 'tab new',
                onClick: () => {
                  this.newTab();
                },
              },
              React.createElement('span', {}, '+')
            )
          )
        );
      }
      renderNotionContainer() {
        this.views.react = Object.fromEntries(
          [...this.state.tabs].map(([id, { title, open }]) => {
            return [
              id,
              this.views.react[id] ||
                React.createElement('webview', {
                  className: 'notion',
                  id,
                  ref: ($notion) => {
                    this.views.html[id] = $notion;
                    this.focusTab();
                  },
                  partition: constants.electronSessionPartition,
                  preload: path.resolve(`${__notion}/app/renderer/preload.js`),
                  src: this.props.notionUrl,
                }),
            ];
          })
        );
        return React.createElement(
          'div',
          {
            style: {
              flexGrow: 1,
              display: this.state.error ? 'none' : 'flex',
            },
          },
          ...Object.values(this.views.react)
        );
      }
      renderSearchContainer() {
        return React.createElement(
          'div',
          {
            style: {
              position: 'fixed',
              overflow: 'hidden',
              pointerEvents: 'none',
              padding: '0 20px',
              top:
                (this.state.searchingPeekView
                  ? 0
                  : process.platform === 'darwin'
                  ? 37
                  : 45) * this.state.zoomFactor,
              right: (48 - 24) * this.state.zoomFactor,
              width: 460 * this.state.zoomFactor,
              height: 72 * this.state.zoomFactor,
              zIndex: 99,
            },
          },
          React.createElement('webview', {
            id: 'search',
            style: {
              width: '100%',
              height: '100%',
              transition: `transform 70ms ease-${
                this.state.searching ? 'out' : 'in'
              }`,
              transform: `translateY(${this.state.searching ? '0' : '-100'}%)`,
              pointerEvents: this.state.searching ? 'auto' : 'none',
            },
            ref: ($search) => {
              this.$search = $search;
              this.focusTab();
            },
            partition: constants.electronSessionPartition,
            preload: `file://${path.resolve(
              `${__notion}/app/renderer/search.js`
            )}`,
            src: `file://${path.resolve(
              `${__notion}/app/renderer/search.html`
            )}`,
          })
        );
      }
      renderErrorContainer() {
        return React.createElement(
          'div',
          {
            style: {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: this.state.error ? 'flex' : 'none',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              paddingBottom: '8vh',
            },
          },
          React.createElement('img', {
            style: {
              width: 300,
              maxWidth: '100%',
            },
            src: './onboarding-offline.png',
          }),
          React.createElement(
            'div',
            {
              style: {
                paddingTop: 16,
                paddingBottom: 16,
                textAlign: 'center',
                lineHeight: 1.4,
                fontSize: 17,
                letterSpacing: '-0.01em',
                color: '#424241',
                fontWeight: 500,
              },
            },
            React.createElement(
              'div',
              null,
              React.createElement(notion_intl.FormattedMessage, {
                id: 'desktopLogin.offline.title',
                defaultMessage: 'Welcome to <strong>Notion</strong>!',
                values: {
                  strong: (...chunks) =>
                    React.createElement('strong', null, chunks),
                },
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement(notion_intl.FormattedMessage, {
                id: 'desktopLogin.offline.message',
                defaultMessage: 'Connect to the internet to get started.',
              })
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'button',
              {
                style: {
                  background: '#fefaf8',
                  border: '1px solid #f1cbca',
                  boxSizing: 'border-box',
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                  borderRadius: 3,
                  lineHeight: 'normal',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  color: '#d8615c',
                  paddingLeft: 12,
                  paddingRight: 12,
                  height: 36,
                },
                onClick: this.handleReload,
              },
              React.createElement(notion_intl.FormattedMessage, {
                id:
                  'desktopLogin.offline.retryConnectingToInternetButton.label',
                defaultMessage: 'Try again',
              })
            )
          )
        );
      }
      render() {
        const notionLocale = localizationHelper.getNotionLocaleFromElectronLocale(
            window.navigator.language
          ),
          result = React.createElement(
            notion_intl.IntlProvider,
            {
              locale: notionLocale,
              messages:
                notionLocale === 'ko-KR'
                  ? koMessages
                  : {
                      'desktopLogin.offline.title':
                        'Welcome to <strong>Notion</strong>!',
                      'desktopLogin.offline.message':
                        'Connect to the internet to get started.',
                      'desktopLogin.offline.retryConnectingToInternetButton.label':
                        'Try again',
                    },
            },
            this.renderTitlebar(),
            this.renderNotionContainer(),
            this.renderSearchContainer(),
            this.renderErrorContainer()
          );
        document.body.classList[this.state.error ? 'add' : 'remove']('error');
        this.loadListeners();
        return result;
      }
    }

    window['__start'] = () => {
      document.body.className = 'notion-dark-theme';
      document.body.setAttribute('data-platform', process.platform);

      const modules = getEnhancements();
      for (let mod of modules.loaded) {
        for (let font of mod.fonts || []) {
          document
            .querySelector('head')
            .appendChild(
              createElement(`<link rel="stylesheet" href="${font}">`)
            );
        }
      }

      for (let mod of modules.loaded) {
        if (
          mod.alwaysActive ||
          store('mods', { [mod.id]: { enabled: false } })[mod.id].enabled
        ) {
          const fileExists = (file) => fs.pathExistsSync(path.resolve(file));
          for (let sheet of ['tabs', 'variables']) {
            if (fileExists(`${__dirname}/../${mod.dir}/${sheet}.css`)) {
              document.head.appendChild(
                createElement(
                  `<link rel="stylesheet" href="enhancement://${mod.dir}/${sheet}.css">`
                )
              );
            }
          }
        }
      }
      electron.ipcRenderer.on('enhancer:set-app-theme', (event, theme) => {
        document.body.className = `notion-${theme}-theme`;
      });

      const parsed = url.parse(window.location.href, true),
        notionUrl =
          parsed.query.path ||
          (store().default_page
            ? idToNotionURL(store().default_page)
            : schemeHelpers.getSchemeUrl({
                httpUrl: config.default.baseURL,
                protocol: config.default.protocol,
              }));
      delete parsed.search;
      delete parsed.query;
      const plainUrl = url.format(parsed);
      window.history.replaceState(undefined, undefined, plainUrl);

      document.title = localizationHelper
        .createIntlShape(
          localizationHelper.getNotionLocaleFromElectronLocale(
            window.navigator.language
          )
        )
        .formatMessage(
          notion_intl.defineMessages({
            documentTitle: {
              id: 'desktop.documentTitle',
              defaultMessage: 'Notion Desktop',
            },
          }).documentTitle
        );
      const $root = document.getElementById('root');
      ReactDOM.render(
        React.createElement(Index, { notionUrl: notionUrl }),
        $root
      );
    };
  } else {
    const __start = window['__start'];
    window['__start'] = () => {
      __start();

      if (store().default_page) {
        new Promise((res, rej) => {
          let attempt;
          attempt = setInterval(() => {
            if (
              !document.getElementById('notion') ||
              !document.getElementById('notion').loadURL
            )
              return;
            clearInterval(attempt);
            res();
          }, 50);
        }).then(() => {
          if (
            document.getElementById('notion').getAttribute('src') ===
              'notion://www.notion.so' &&
            idToNotionURL(store().default_page)
          ) {
            document
              .getElementById('notion')
              .loadURL(idToNotionURL(store().default_page));
          }
        });
      }

      const dragarea = document.querySelector(
          '#root [style*="-webkit-app-region: drag"]'
        ),
        default_styles = dragarea.getAttribute('style');
      if (store().tiling_mode) {
        dragarea.style.display = 'none';
      } else {
        document
          .getElementById('notion')
          .addEventListener('ipc-message', (event) => {
            if (event.channel !== 'enhancer:sidebar-width') return;
            dragarea.setAttribute(
              'style',
              `${default_styles} top: 2px; height: ${
                store('cf8a7b27-5a4c-4d45-a4cb-1d2bbc9e9014').dragarea_height
              }px; left: ${event.args[0]};`
            );
          });

        document.getElementById('notion').addEventListener('dom-ready', () => {
          document
            .getElementById('notion')
            .getWebContents()
            .executeJavaScript(insertCSP);
        });
      }
    };
  }
};
