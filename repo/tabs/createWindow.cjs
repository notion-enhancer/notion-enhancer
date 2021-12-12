/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({ env }, db, __exports, __eval) {
  const { BrowserWindow } = require('electron'),
    notionCreateWindow = __exports.createWindow;
  __exports.createWindow = (relativeUrl = '', args) => {
    const windows = BrowserWindow.getAllWindows();
    if (relativeUrl && windows.length) {
      windows[0].webContents.send('notion-enhancer:open-tab', {
        notionUrl: `notion://www.notion.so${relativeUrl}`,
      });
      return windows[0];
    }
    return notionCreateWindow(relativeUrl, args);
  };
};
