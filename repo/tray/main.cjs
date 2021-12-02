/*
 * notion-enhancer: tray
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

let tray;

module.exports = async function ({ env, registry }, db, __exports, __eval) {
  const electron = require('electron'),
    path = require('path'),
    enhancerIcon = path.resolve(`${__dirname}/../../media/colour-x16.png`),
    hotkey = await db.get(['hotkey']),
    runInBackground = await db.get(['run_in_background']),
    menuHotkey = await (
      await registry.db('a6621988-551d-495a-97d8-3c568bca2e9e')
    ).get(['hotkey']);

  const toggleWindows = (checkFocus = true) => {
    const windows = electron.BrowserWindow.getAllWindows();
    if (runInBackground) {
      // hide
      if (windows.some((win) => (checkFocus ? win.isFocused() : true) && win.isVisible())) {
        windows.forEach((win) => [win.isFocused() && win.blur(), win.hide()]);
      } else windows.forEach((win) => win.show());
    } else {
      // minimize
      if (windows.some((win) => (checkFocus ? win.isFocused() : true) && !win.isMinimized())) {
        windows.forEach((win) => win.minimize());
      } else windows.forEach((win) => win.restore());
    }
  };

  await electron.app.whenReady();
  tray = new electron.Tray(enhancerIcon);
  tray.setToolTip('notion-enhancer');
  tray.on('click', () => toggleWindows(false));
  electron.globalShortcut.register(hotkey, toggleWindows);

  // connects to client hotkey listener
  // manually forces new window creation
  // since notion's default is broken by
  // duplicate window prevention
  const createWindow = () => {
    const { createWindow } = env.notionRequire('main/createWindow.js');
    createWindow('', null, true);
  };
  electron.ipcMain.on(`notion-enhancer:create-new-window`, createWindow);

  const contextMenu = electron.Menu.buildFromTemplate([
    {
      type: 'normal',
      label: 'notion-enhancer',
      icon: enhancerIcon,
      enabled: false,
    },
    { type: 'separator' },
    {
      type: 'normal',
      label: 'docs',
      click: () => electron.shell.openExternal('https://notion-enhancer.github.io/'),
    },
    {
      type: 'normal',
      label: 'source code',
      click: () => electron.shell.openExternal('https://github.com/notion-enhancer/'),
    },
    {
      type: 'normal',
      label: 'community',
      click: () => electron.shell.openExternal('https://discord.gg/sFWPXtA'),
    },
    {
      type: 'normal',
      label: 'enhancements menu',
      accelerator: menuHotkey,
      click: env.focusMenu,
    },
    { type: 'separator' },
    {
      type: 'normal',
      label: 'toggle visibility',
      accelerator: hotkey,
      click: toggleWindows,
    },
    {
      type: 'normal',
      label: 'new window',
      click: createWindow,
      accelerator: 'CmdOrCtrl+Shift+N',
    },
    {
      label: 'relaunch',
      click: env.reload,
    },
    {
      label: 'quit',
      role: 'quit',
    },
  ]);
  tray.setContextMenu(contextMenu);
};

// hide on open
// maybe only do once to hide first window?

// exports.createWindow = (...args) => {
//   warmWindowState.warmedWindow = true;
//   createWindow(...args);
// };
