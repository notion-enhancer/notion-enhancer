/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';
module.exports = {};

const onMessage = (id, callback) => {
  const { ipcMain } = require('electron');
  ipcMain.on(`notion-enhancer:${id}`, callback);
};

let enhancerMenu;
module.exports.focusMenu = async () => {
  if (enhancerMenu) return enhancerMenu.show();

  const { fs } = require('notion-enhancer/api/index.cjs'),
    { app, session, BrowserWindow } = require('electron'),
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

  let appQuit = false;
  app.once('before-quit', () => {
    appQuit = true;
  });

  const trayID = 'f96f4a73-21af-4e3f-a68f-ab4976b020da',
    runInBackground =
      (await registry.enabled(trayID)) &&
      (await (await registry.db(trayID)).get(['run_in_background']));
  enhancerMenu.on('close', (e) => {
    const isLastWindow = BrowserWindow.getAllWindows().length === 1;
    if (!appQuit && isLastWindow && runInBackground) {
      enhancerMenu.hide();
      e.preventDefault();
    } else enhancerMenu = null;
  });
};

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
