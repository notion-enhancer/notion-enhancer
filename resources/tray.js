/* === INJECTION MARKER === */

/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

// adds: tray support (inc. context menu with settings), window toggle hotkey

// DO NOT REMOVE THE MARKERS ABOVE.
// DO NOT CHANGE THE NAME OF THE 'enhancements()' FUNCTION.

let tray;

function enhancements() {
  const { Tray, Menu, nativeImage, app } = require('electron'),
    isMac = process.platform === 'darwin',
    path = require('path'),
    store = require(path.join(__dirname, '..', 'store.js'))({
      config: 'user-preferences',
      defaults: {
        openhidden: false,
        maximized: false,
        tray: false,
        theme: false,
      },
    });
  tray = new Tray(
    isMac
      ? new nativeImage.createFromPath('☃☃☃resources☃☃☃/icons/logo.png').resize(
          {
            width: 16,
            height: 16,
          }
        )
      : '☃☃☃resources☃☃☃/icons/tray.ico'
  );
  const contextMenu = Menu.buildFromTemplate([
    {
      id: 'startup',
      label: 'Run on startup',
      type: 'checkbox',
      checked: electron_1.app.getLoginItemSettings().openAtLogin,
      click: () => {
        contextMenu.getMenuItemById('startup').checked
          ? electron_1.app.setLoginItemSettings({ openAtLogin: true })
          : electron_1.app.setLoginItemSettings({ openAtLogin: false });
      },
    },
    {
      id: 'openhidden',
      label: 'Hide on open',
      type: 'checkbox',
      checked: store.openhidden,
      click: () => {
        store.openhidden = contextMenu.getMenuItemById('openhidden').checked;
      },
    },
    {
      id: 'maximized',
      label: 'Open maximised',
      type: 'checkbox',
      checked: store.maximized,
      click: () => {
        store.maximized = contextMenu.getMenuItemById('maximized').checked;
      },
    },
    {
      id: 'tray',
      label: 'Close to tray',
      type: 'checkbox',
      checked: store.tray,
      click: () => {
        store.tray = contextMenu.getMenuItemById('tray').checked;
      },
    },
    {
      id: 'theme',
      label: 'Load theme.css',
      type: 'checkbox',
      checked: store.theme,
      click: () => {
        store.theme = contextMenu.getMenuItemById('theme').checked;
        electron_1.BrowserWindow.getAllWindows().forEach((win) => win.reload());
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      role: 'quit',
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Notion Enhancements');

  function showWindows() {
    const windows = electron_1.BrowserWindow.getAllWindows();
    if (isMac) app.show();
    if (store.maximized) windows.forEach((win) => [win.maximize()]);
    else windows.forEach((win) => win.show());
    app.focus({ steal: true });
  }
  function hideWindows() {
    const windows = electron_1.BrowserWindow.getAllWindows();
    windows.forEach((win) => [win.isFocused() && win.blur(), win.hide()]);
    if (isMac) app.hide();
  }
  tray.on('click', () => {
    const windows = electron_1.BrowserWindow.getAllWindows();
    if (windows.some((win) => win.isVisible())) hideWindows();
    else showWindows();
  });
  // hotkey will be set by python script
  electron_1.globalShortcut.register('CmdOrCtrl+Shift+A', () => {
    const windows = electron_1.BrowserWindow.getAllWindows();
    if (windows.some((win) => win.isFocused() && win.isVisible()))
      hideWindows();
    else showWindows();
  });
}
