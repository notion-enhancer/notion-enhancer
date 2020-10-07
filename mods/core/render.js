/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const url = require('url'),
  path = require('path'),
  electron = require('electron'),
  { __notion } = require('../../pkg/helpers.js'),
  config = require(`${__notion}/app/config.js`),
  constants = require(`${__notion}/app/shared/constants.js`),
  notion_intl = require(`${__notion}/app/shared/notion-intl/index.js`),
  notionIpc = require(`${__notion}/app/helpers/notionIpc.js`),
  localizationHelper = require(`${__notion}/app/helpers/localizationHelper.js`),
  koMessages = require(`${__notion}/app/i18n/ko_KR/messages.json`),
  schemeHelpers = require(`${__notion}/app/shared/schemeHelpers.js`),
  React = require(`${__notion}/app/node_modules/react/index.js`),
  ReactDOM = require(`${__notion}/app/node_modules/react-dom/index.js`);

const insertCSP = `
  const csp = document.createElement('meta');
  csp.httpEquiv = 'Content-Security-Policy';
  csp.content = "script-src 'self' 'unsafe-inline' 'unsafe-eval' enhancement: https://gist.github.com https://apis.google.com https://api.amplitude.com https://widget.intercom.io https://js.intercomcdn.com https://logs-01.loggly.com https://cdn.segment.com https://analytics.pgncs.notion.so https://checkout.stripe.com https://embed.typeform.com https://admin.typeform.com https://platform.twitter.com https://cdn.syndication.twimg.com; connect-src 'self' https://msgstore.www.notion.so wss://msgstore.www.notion.so https://notion-emojis.s3-us-west-2.amazonaws.com https://s3-us-west-2.amazonaws.com https://s3.us-west-2.amazonaws.com https://notion-production-snapshots-2.s3.us-west-2.amazonaws.com https: http: https://api.amplitude.com https://api.embed.ly https://js.intercomcdn.com https://api-iam.intercom.io wss://nexus-websocket-a.intercom.io https://logs-01.loggly.com https://api.segment.io https://api.pgncs.notion.so https://checkout.stripe.com https://cdn.contentful.com https://preview.contentful.com https://images.ctfassets.net https://api.unsplash.com https://boards-api.greenhouse.io; font-src 'self' data: https://cdnjs.cloudflare.com https://js.intercomcdn.com; img-src 'self' data: blob: https: https://platform.twitter.com https://syndication.twitter.com https://pbs.twimg.com https://ton.twimg.com; style-src 'self' 'unsafe-inline' enhancement: https://cdnjs.cloudflare.com https://github.githubassets.com https://platform.twitter.com https://ton.twimg.com; frame-src https: http:; media-src https: http:";
  document.head.appendChild(csp);
`;

module.exports = (store, __exports) => {
  if (store().tabs) {
    class Index extends React.PureComponent {
      constructor() {
        super(...arguments);
        this.state = {
          error: false,
          searching: false,
          searchingPeekView: false,
          zoomFactor: 1,
          tabIDs: [],
        };
        this.$titlebar = null;
        this.tabs = {
          $current: null,
          react: {},
          active: [],
          loading: [],
        };
        this.$search = null;
        this.handleReload = () => {
          this.setState({ error: false });
          this.tabs.loading.forEach(($notion) => {
            if ($notion.isWaitingForResponse()) $notion.reload();
          });
        };
        this.setTheme = this.setTheme.bind(this);
        this.startSearch = this.startSearch.bind(this);
        this.stopSearch = this.stopSearch.bind(this);
        this.nextSearch = this.nextSearch.bind(this);
        this.prevSearch = this.prevSearch.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.doneSearch = this.doneSearch.bind(this);
        window['tab'] = (id) => {
          if (!id && id !== 0) return;
          this.setState({ tabIDs: [...new Set([...this.state.tabIDs, id])] });
          setTimeout(() => {
            this.loadListeners();
            this.blurListeners();
            if (document.querySelector(`#tab-${id}`)) {
              this.tabs.active.forEach(($notion) => {
                $notion.style.display = 'none';
              });
              this.tabs.$current = document.querySelector(`#tab-${id}`);
              this.tabs.$current.style.display = 'flex';
              this.focusListeners();
            }
          }, 1000);
        };
      }
      componentDidMount() {
        const buttons = require('./buttons.js')(store);
        this.$titlebar.appendChild(buttons.element);
        this.loadListeners();
      }

      setTheme(event) {
        if (event.channel !== 'enhancer:set-tab-theme') return;
        for (const style of event.args[0])
          document.body.style.setProperty(style[0], style[1]);
      }
      startSearch(isPeekView) {
        this.setState({
          searching: true,
          searchingPeekView: isPeekView,
        });
        if (document.activeElement instanceof HTMLElement)
          document.activeElement.blur();
        this.$search.focus();
        notionIpc.sendIndexToSearch(this.$search, 'search:start');
        notionIpc.sendIndexToNotion(this.$search, 'search:started');
      }
      stopSearch() {
        notionIpc.sendIndexToSearch(this.$search, 'search:reset');
        this.setState({
          searching: false,
        });
        this.lastSearchQuery = undefined;
        this.tabs.$current.getWebContents().stopFindInPage('clearSelection');
        notionIpc.sendIndexToNotion(this.tabs.$current, 'search:stopped');
      }
      nextSearch(query) {
        this.tabs.$current.getWebContents().findInPage(query, {
          forward: true,
          findNext: query === this.lastSearchQuery,
        });
        this.lastSearchQuery = query;
      }
      prevSearch(query) {
        this.tabs.$current.getWebContents().findInPage(query, {
          forward: false,
          findNext: query === this.lastSearchQuery,
        });
        this.lastSearchQuery = query;
      }
      clearSearch() {
        this.lastSearchQuery = undefined;
        this.tabs.$current.getWebContents().stopFindInPage('clearSelection');
      }
      doneSearch() {
        this.lastSearchQuery = undefined;
        this.tabs.$current.getWebContents().stopFindInPage('clearSelection');
        this.setState({ searching: false });
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        this.tabs.$current.focus();
        notionIpc.sendIndexToNotion(this.tabs.$current, 'search:stopped');
      }
      focusListeners() {
        this.tabs.$current.addEventListener('ipc-message', this.setTheme);
        notionIpc.receiveIndexFromNotion.addListener(
          this.tabs.$current,
          'search:start',
          this.startSearch
        );
        notionIpc.receiveIndexFromNotion.addListener(
          this.tabs.$current,
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
        if (!this.tabs.$current) return;
        if (this.state.searching) this.stopSearch();
        this.tabs.$current.removeEventListener('ipc-message', this.setTheme);
        notionIpc.receiveIndexFromNotion.removeListener(
          this.tabs.$current,
          'search:start',
          this.startSearch
        );
        notionIpc.receiveIndexFromNotion.removeListener(
          this.tabs.$current,
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
        this.tabs.loading
          .filter(($notion) => !this.tabs.active.includes($notion))
          .forEach(($notion) => {
            this.tabs.active.push($notion);
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
            electronWindow.addListener('app-command', (e, cmd) => {
              const webContents = $notion.getWebContents();
              if (cmd === 'browser-backward' && webContents.canGoBack()) {
                webContents.goBack();
              } else if (
                cmd === 'browser-forward' &&
                webContents.canGoForward()
              ) {
                webContents.goForward();
              }
            });
            electronWindow.addListener('swipe', (e, dir) => {
              const webContents = $notion.getWebContents();
              if (dir === 'left' && webContents.canGoBack()) {
                webContents.goBack();
              } else if (dir === 'right' && webContents.canGoForward()) {
                webContents.goForward();
              }
            });
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
        this.tabs.loading = [];
      }

      renderTitlebar() {
        return React.createElement(
          'header',
          {
            id: 'titlebar',
            ref: ($titlebar) => {
              this.$titlebar = $titlebar;
            },
          },
          React.createElement('div', { id: 'tabs' })
        );
      }
      renderNotionContainer() {
        this.tabs.react = Object.fromEntries(
          this.state.tabIDs.map((id) => {
            return [
              id,
              this.tabs.react[id] ||
                React.createElement('webview', {
                  className: 'notion',
                  id: `tab-${id}`,
                  style: {
                    width: '100%',
                    height: '100%',
                    display: 'none',
                  },
                  ref: ($notion) => {
                    this.tabs.loading.push($notion);
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
          ...Object.values(this.tabs.react)
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
              width: 440 * this.state.zoomFactor,
              height: 72 * this.state.zoomFactor,
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
              messages: notionLocale === 'ko-KR' ? koMessages : {},
            },
            this.renderTitlebar(),
            this.renderNotionContainer(),
            this.renderSearchContainer(),
            this.renderErrorContainer()
          );
        this.loadListeners();
        return result;
      }
    }

    window['__start'] = () => {
      document.head.innerHTML += `<link rel="stylesheet" href="${__dirname}/css/tabs.css" />`;

      const parsed = url.parse(window.location.href, true),
        notionUrl =
          parsed.query.path ||
          schemeHelpers.getSchemeUrl({
            httpUrl: config.default.baseURL,
            protocol: config.default.protocol,
          });
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

      tab(0);
    };
  } else {
    const __start = window['__start'];
    window['__start'] = () => {
      __start();
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
                store().dragarea_height
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
