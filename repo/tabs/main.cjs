/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({}, db, __exports, __eval) {
  const electron = require('electron');
  electron.ipcMain.on('notion-enhancer:close-tab', (event, { window, id }) => {
    electron.webContents.fromId(window).send('notion-enhancer:close-tab', id);
  });

  __eval(`
    const notionHandleActivate = handleActivate;
    handleActivate = (relativeUrl) => {
      const { BrowserWindow } = require('electron'),
        windows = BrowserWindow.getAllWindows(),
        focusedWindow = BrowserWindow.getFocusedWindow();
      if (relativeUrl && windows.length) {
        const win = focusedWindow || windows[0];
        win.webContents.send('notion-enhancer:open-tab', {
          notionUrl: \`notion://www.notion.so\$\{relativeUrl\}\`,
        });
        win.show();
        win.focus();
      } else notionHandleActivate(relativeUrl);
    };
  `);
};
