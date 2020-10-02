/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const url = require('url'),
  path = require('path'),
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
          tabs: 2,
        };
        this.notionElm = [];
        this.loadedElms = [];
        this.reactTabs = [];
        this.handleNotionRef = (notionElm) => {
          this.notionElm.push(notionElm);
        };
        this.searchElm = null;
        this.handleSearchRef = (searchElm) => {
          this.searchElm = searchElm;
        };
        this.handleReload = () => {
          this.setState({ error: false });
          setTimeout(() => {
            if (this.notionElm.length) {
              this.notionElm.forEach(($notion) => {
                if ($notion.isWaitingForResponse()) $notion.reload();
              });
            }
          }, 50);
        };
        window['newtab'] = () => {
          this.setState({ tabs: this.state.tabs + 1 });
          setTimeout(() => this.addListeners(), 100);
        };
      }
      componentDidMount() {
        this.addListeners();
      }
      addListeners() {
        const searchElm = this.searchElm;
        const notionElm = this.notionElm;
        if (!searchElm || !notionElm.length) {
          return;
        }

        notionElm
          .filter(($notion) => !this.loadedElms.includes($notion))
          .forEach(($notion) => {
            this.loadedElms.push($notion);
            $notion.addEventListener('did-fail-load', (error) => {
              // logger.info('Failed to load:', error);
              if (error.errorCode === -3) {
                return;
              }
              if (
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
            notionIpc.receiveIndexFromNotion.addListener(
              $notion,
              'search:start',
              (isPeekView) => {
                this.setState({
                  searching: true,
                  searchingPeekView: isPeekView,
                });
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                searchElm.focus();
                notionIpc.sendIndexToSearch(searchElm, 'search:start');
                notionIpc.sendIndexToNotion(searchElm, 'search:started');
              }
            );
            notionIpc.receiveIndexFromNotion.addListener(
              $notion,
              'search:stop',
              () => {
                notionIpc.sendIndexToSearch(searchElm, 'search:reset');
                this.setState({
                  searching: false,
                });
                this.lastSearchQuery = undefined;
                $notion.getWebContents().stopFindInPage('clearSelection');
                notionIpc.sendIndexToNotion($notion, 'search:stopped');
              }
            );
            notionIpc.receiveIndexFromSearch.addListener(
              searchElm,
              'search:next',
              (query) => {
                $notion.getWebContents().findInPage(query, {
                  forward: true,
                  findNext: query === this.lastSearchQuery,
                });
                this.lastSearchQuery = query;
              }
            );
            notionIpc.receiveIndexFromSearch.addListener(
              searchElm,
              'search:prev',
              (query) => {
                $notion.getWebContents().findInPage(query, {
                  forward: false,
                  findNext: query === this.lastSearchQuery,
                });
                this.lastSearchQuery = query;
              }
            );
            notionIpc.receiveIndexFromSearch.addListener(
              searchElm,
              'search:clear',
              () => {
                this.lastSearchQuery = undefined;
                $notion.getWebContents().stopFindInPage('clearSelection');
              }
            );
            notionIpc.receiveIndexFromSearch.addListener(
              searchElm,
              'search:stop',
              () => {
                this.lastSearchQuery = undefined;
                $notion.getWebContents().stopFindInPage('clearSelection');
                this.setState({ searching: false });
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                $notion.focus();
                notionIpc.sendIndexToNotion($notion, 'search:stopped');
              }
            );
            $notion.addEventListener('dom-ready', () => {
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
                    searchElm,
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
                  searchElm,
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
                searchElm.getWebContents().setZoomFactor(zoomFactor);
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
            electronWindow.on('focus', (e) => {
              $notion.focus();
            });
            $notion.addEventListener('dom-ready', function () {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              $notion.blur();
              $notion.focus();
            });
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
      }
      renderSearchContainer() {
        return React.createElement(
          'div',
          { style: this.getSearchContainerStyle() },
          React.createElement('webview', {
            id: 'search',
            style: this.getSearchWebviewStyle(),
            ref: this.handleSearchRef,
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
      renderNotionContainer() {
        this.reactTabs = [
          ...this.reactTabs,
          ...new Array(this.state.tabs - this.reactTabs.length)
            .fill(0)
            .map((i) =>
              React.createElement('webview', {
                className: 'notion',
                style: Index.notionWebviewStyle,
                ref: this.handleNotionRef,
                partition: constants.electronSessionPartition,
                preload: path.resolve(`${__notion}/app/renderer/preload.js`),
                src: this.props.notionUrl,
              })
            ),
        ];
        return React.createElement(
          'div',
          { style: this.getNotionContainerStyle() },
          ...this.reactTabs
        );
      }
      renderErrorContainer() {
        return React.createElement(
          'div',
          { style: this.getErrorContainerStyle() },
          React.createElement('img', {
            style: Index.frontImageStyle,
            src: './onboarding-offline.png',
          }),
          React.createElement(
            'div',
            { style: Index.frontMessageStyle },
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
              { style: Index.reloadButtonStyle, onClick: this.handleReload },
              React.createElement(notion_intl.FormattedMessage, {
                id:
                  'desktopLogin.offline.retryConnectingToInternetButton.label',
                defaultMessage: 'Try again',
              })
            )
          )
        );
      }
      renderDragRegion() {
        return React.createElement('div', { style: Index.dragRegionStyle });
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
            this.renderDragRegion(),
            this.renderNotionContainer(),
            this.renderSearchContainer(),
            this.renderErrorContainer()
          );
        this.addListeners();
        return result;
      }
      getNotionContainerStyle() {
        const style = {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: this.state.error ? 'none' : 'flex',
        };
        return style;
      }
      getErrorContainerStyle() {
        const style = {
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
        };
        return style;
      }
      getSearchWebviewStyle() {
        const style = {
          width: '100%',
          height: '100%',
          transition: 'transform 70ms ease-in',
          transform: 'translateY(-100%)',
          pointerEvents: 'none',
        };
        if (this.state.searching) {
          style.transition = 'transform 70ms ease-out';
          style.transform = 'translateY(0%)';
          style.pointerEvents = 'auto';
        }
        return style;
      }
      getSearchContainerStyle() {
        const style = {
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
        };
        return style;
      }
    }
    Index.frontMessageStyle = {
      paddingTop: 16,
      paddingBottom: 16,
      textAlign: 'center',
      lineHeight: 1.4,
      fontSize: 17,
      letterSpacing: '-0.01em',
      color: '#424241',
      fontWeight: 500,
    };
    Index.reloadButtonStyle = {
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
    };
    Index.frontImageStyle = {
      width: 300,
      maxWidth: '100%',
    };
    Index.notionWebviewStyle = {
      width: '100%',
      height: '100%',
    };
    Index.dragRegionStyle = {
      position: 'absolute',
      zIndex: 9999,
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      pointerEvents: 'none',
      WebkitAppRegion: 'drag',
    };

    window['__start'] = () => {
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
      const rootElm = document.getElementById('root');
      ReactDOM.render(
        React.createElement(Index, { notionUrl: notionUrl }),
        rootElm
      );
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
      }
    };
  }
};
