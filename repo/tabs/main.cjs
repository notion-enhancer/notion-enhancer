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
};
