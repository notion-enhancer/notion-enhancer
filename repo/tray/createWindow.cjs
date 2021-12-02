/*
 * notion-enhancer: tray
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function (api, db, __exports, __eval) {
  const electron = require('electron'),
    { isMenuOpen } = require('notion-enhancer/worker.cjs'),
    runInBackground = await db.get(['run_in_background']);
  if (!runInBackground) return;

  let appQuit = false;
  electron.app.on('before-quit', () => {
    appQuit = true;
  });

  const notionCreateWindow = __exports.createWindow;
  __exports.createWindow = (relativeUrl = '', args, force = false) => {
    const windows = electron.BrowserWindow.getAllWindows();
    if (windows.length) windows.forEach((win) => win.show());

    if (force || !windows.length) {
      // hijack close event to hide instead
      const window = notionCreateWindow(relativeUrl, args);
      window.prependListener('close', (e) => {
        const isLastNotionWindow =
          electron.BrowserWindow.getAllWindows().length === (isMenuOpen() ? 2 : 1);
        if (!appQuit && isLastNotionWindow) {
          window.hide();
          e.preventDefault();
          throw new Error('<fake error>: prevent window close');
        }
      });
      return window;
    } else {
      // prevents duplicate windows on dock/taskbar click
      windows[0].focus();
      return windows[0];
    }
  };
};
