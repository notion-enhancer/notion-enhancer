/**
 * notion-enhancer: theming
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function ({}, db, __exports, __eval) {
  const electron = require('electron');
  electron.ipcMain.on('notion-enhancer:update-theme', () => {
    electron.webContents
      .getAllWebContents()
      .forEach((webContents) => webContents.send('notion-enhancer:update-theme'));
  });
  electron.ipcMain.on('notion-enhancer:set-search-theme', (event, theme) => {
    electron.webContents
      .getAllWebContents()
      .forEach((webContents) => webContents.send('notion-enhancer:set-search-theme', theme));
  });
};
