/* === INJECTION MARKER === */

/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

// adds: tray support (inc. context menu with settings), window toggle hotkey

// DO NOT REMOVE THE INJECTION MARKER ABOVE.
// DO NOT CHANGE THE NAME OF THE 'enhancements()' FUNCTION.

let tray;

function enhancements() {
  const { Tray, Menu } = require('electron'),
    path = require('path'),
    store = require(path.join(__dirname, '..', 'store.js'))({
      config: 'user-preferences',
      defaults: {
        openhidden: false,
        maximised: false,
        tray: false,
        theme: false,
      },
    });
  tray = new Tray(path.join(__dirname, 'notion.ico'));
  const contextMenu = Menu.buildFromTemplate([
    {
      id: 'startup',
      label: 'run on startup',
      type: 'checkbox',
      checked: electron_1.app.getLoginItemSettings().openAtLogin,
      click: () =>
        contextMenu.getMenuItemById('startup').checked
          ? electron_1.app.setLoginItemSettings({ openAtLogin: true })
          : electron_1.app.setLoginItemSettings({ openAtLogin: false }),
    },
    {
      id: 'openhidden',
      label: 'hide on open',
      type: 'checkbox',
      checked: store.openhidden,
      click: () =>
        contextMenu.getMenuItemById('openhidden').checked
          ? (store.openhidden = true)
          : (store.openhidden = false),
    },
    {
      id: 'maximised',
      label: 'open maximised',
      type: 'checkbox',
      checked: store.maximised,
      click: () =>
        contextMenu.getMenuItemById('maximised').checked
          ? (store.maximised = true)
          : (store.maximised = false),
    },
    {
      id: 'tray',
      label: 'close to tray',
      type: 'checkbox',
      checked: store.tray,
      click: () =>
        contextMenu.getMenuItemById('tray').checked
          ? (store.tray = true)
          : (store.tray = false),
    },
    {
      id: 'theme',
      label: 'load theme.css',
      type: 'checkbox',
      checked: store.theme,
      click: () => {
        contextMenu.getMenuItemById('theme').checked
          ? (store.theme = true)
          : (store.theme = false);
        electron_1.BrowserWindow.getAllWindows().forEach((win) => win.reload());
      },
    },
    {
      type: 'separator',
    },
    {
      label: '(x) quit',
      role: 'quit',
    },
  ]);
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    const windows = electron_1.BrowserWindow.getAllWindows();
    if (windows.some((win) => win.isVisible()))
      windows.forEach((win) => win.hide());
    else if (store.maximised) windows.forEach((win) => win.maximize());
    else windows.forEach((win) => win.show());
  });
  const hotkey = '☃☃☃hotkey☃☃☃'; // will be set by python script;
  electron_1.globalShortcut.register(hotkey, () => {
    const windows = electron_1.BrowserWindow.getAllWindows(),
      focused = electron_1.BrowserWindow.getFocusedWindow();
    if (windows.some((win) => win.isVisible() && focused))
      windows.forEach((win) => win.hide());
    else if (store.maximised) windows.forEach((win) => win.maximize());
    else windows.forEach((win) => win.show());
  });
}
