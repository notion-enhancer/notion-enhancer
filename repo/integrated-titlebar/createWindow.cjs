/*
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function (api, db, __exports) {
  const notionCreateWindow = __exports.createWindow;
  // __exports.createWindow = (relativeUrl = '', args) => {
  //   const windowState = require('electron-window-state').default({
  //     defaultWidth: 1320,
  //     defaultHeight: 860,
  //   });
  //   const focusedWindow = electron_1.BrowserWindow.getFocusedWindow();
  //   const rect = getRectFromFocusedWindow(windowState);
  //   const windowCreationArgs = Object.assign(Object.assign({}, rect), {
  //     show: false,
  //     backgroundColor: '#ffffff',
  //     titleBarStyle: 'hiddenInset',
  //     autoHideMenuBar: true,
  //     webPreferences: {
  //       preload: path_1.default.resolve(__dirname, '../renderer/index.js'),
  //       webviewTag: true,
  //       session: electron_1.session.fromPartition(constants_1.electronSessionPartition),
  //       enableRemoteModule: true,
  //     },
  //   });
  //   const { window, warmed } = getNextWindow(windowCreationArgs);
  //   window.setMenuBarVisibility(false);
  //   warmWindowState.warmedWindow = undefined;
  //   window.once('ready-to-show', () => {
  //     if (args && args.isLocalhost) {
  //       return;
  //     }
  //     if (!warmed) {
  //       window.show();
  //     }
  //   });
  //   if (warmed) {
  //     if (warmWindowState.warmedLoaded) {
  //       notionIpc.sendMainToNotionWindow(window, 'notion:navigate-to-url', relativeUrl);
  //     } else {
  //       void window.loadURL(urlHelpers_1.getIndexUrl(relativeUrl));
  //     }
  //     window.setBounds(getRectFromFocusedWindow(windowState));
  //     window.show();
  //   } else {
  //     void window.loadURL(urlHelpers_1.getIndexUrl(relativeUrl));
  //   }
  //   if (focusedWindow) {
  //     if (focusedWindow.isFullScreen()) {
  //       window.setFullScreen(true);
  //     }
  //   } else {
  //     if (windowState.isFullScreen) {
  //       window.setFullScreen(true);
  //     }
  //   }
  //   window.on('close', () => {
  //     windowState.saveState(window);
  //     if (process.platform === 'win32') {
  //       const currentWindows = electron_1.BrowserWindow.getAllWindows();
  //       const hasNoOtherOpenWindows = currentWindows.every((currentWindow) =>
  //         Boolean(
  //           currentWindow.id === window.id ||
  //             (warmWindowState.warmedWindow &&
  //               currentWindow.id === warmWindowState.warmedWindow.id)
  //         )
  //       );
  //       if (hasNoOtherOpenWindows) {
  //         electron_2.app.quit();
  //       }
  //     }
  //   });
  //   setImmediate(() => {
  //     warmWindowState.warmedLoaded = false;
  //   });
  //   return window;
  // };
};
