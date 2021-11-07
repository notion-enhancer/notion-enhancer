/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';
module.exports = {};

const sendMessage = (id, data) => {
    const { ipcMain } = require('electron');
    ipcMain.send(`notion-enhancer:${id}`, data);
  },
  onMessage = (id, callback) => {
    const { ipcMain } = require('electron');
    ipcMain.on(`notion-enhancer:${id}`, callback);
  };

let enhancerMenu;
module.exports.focusMenu = () => {
  if (enhancerMenu) return enhancerMenu.show();

  const { fs } = require('notion-enhancer/api/_.cjs'),
    { session, BrowserWindow } = require('electron'),
    windowState = require('electron-window-state')({
      file: 'enhancer-menu-window-state.json',
      defaultWidth: 1250,
      defaultHeight: 850,
    });

  enhancerMenu = new BrowserWindow({
    show: true,
    // frame: !store().frameless,
    titleBarStyle: 'hiddenInset',
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      session: session.fromPartition('persist:notion'),
      preload: require('path').resolve(`${__dirname}/electronApi.cjs`),
    },
  });
  enhancerMenu.loadURL(fs.localPath('repo/menu/menu.html'));
  windowState.manage(enhancerMenu);

  enhancerMenu.on('close', (e) => {
    enhancerMenu = null;
  });
};

module.exports.focusNotion = () => {
  const { env } = require('notion-enhancer/api/_.cjs'),
    { BrowserWindow } = require('electron'),
    { createWindow } = env.notionRequire('main/createWindow.js');
  let window = BrowserWindow.getAllWindows().find((win) => win.id !== enhancerMenu.id);
  if (!window) window = createWindow();
  window.show();
};

module.exports.reload = () => {
  const { app } = require('electron');
  app.relaunch();
  app.exit(0);
};

module.exports.listen = () => {
  onMessage('focusMenu', module.exports.focusMenu);
  onMessage('focusNotion', module.exports.focusNotion);
  onMessage('reload', module.exports.reload);
};
