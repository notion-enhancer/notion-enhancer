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
module.exports.focusMenu = async () => {
  if (enhancerMenu) return enhancerMenu.show();

  const { fs } = require('notion-enhancer/api/index.cjs'),
    { session, BrowserWindow } = require('electron'),
    windowState = require('electron-window-state')({
      file: 'enhancer-menu-window-state.json',
      defaultWidth: 1250,
      defaultHeight: 850,
    }),
    { registry } = require('notion-enhancer/api/index.cjs'),
    integratedTitlebar = await registry.enabled('a5658d03-21c6-4088-bade-fa4780459133');

  enhancerMenu = new BrowserWindow({
    show: true,
    frame: !integratedTitlebar,
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

module.exports.isMenuOpen = () => !!enhancerMenu;

module.exports.focusNotion = () => {
  const { env } = require('notion-enhancer/api/index.cjs'),
    { BrowserWindow } = require('electron'),
    { createWindow } = env.notionRequire('main/createWindow.js');
  let window = BrowserWindow.getAllWindows().find((win) => win.id !== enhancerMenu.id);
  if (!window) window = createWindow();
  window.show();
};

module.exports.reload = () => {
  const { app } = require('electron');
  app.relaunch({ args: process.argv.slice(1).filter((arg) => arg !== '--startup') });
  app.exit(0);
};

module.exports.listen = () => {
  onMessage('focusMenu', module.exports.focusMenu);
  onMessage('focusNotion', module.exports.focusNotion);
  onMessage('reload', module.exports.reload);
};
