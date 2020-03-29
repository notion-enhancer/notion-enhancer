/* === INJECTION MARKER === */

/*
 * Notion Enhancer
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
    store = new (require(path.join(__dirname, '..', 'store.js')))({
      config: 'user-preferences',
      defaults: {
        openhidden: false,
        maximised: false,
        tray: false
      }
    }),
    states = {
      startup: electron_1.app.getLoginItemSettings().openAtLogin,
      openhidden: store.get('openhidden'),
      maximised: store.get('maximised'),
      tray: store.get('tray')
    };

  tray = new Tray(path.join(__dirname, './notion.ico'));
  const contextMenu = Menu.buildFromTemplate([
    {
      id: 'startup',
      label: 'run on startup',
      type: 'checkbox',
      checked: states.startup,
      click: () =>
        contextMenu.getMenuItemById('startup').checked
          ? electron_1.app.setLoginItemSettings({ openAtLogin: true })
          : electron_1.app.setLoginItemSettings({ openAtLogin: false })
    },
    {
      id: 'openhidden',
      label: 'hide on open',
      type: 'checkbox',
      checked: states.openhidden,
      click: () =>
        contextMenu.getMenuItemById('openhidden').checked
          ? store.set('openhidden', true)
          : store.set('openhidden', false)
    },
    {
      id: 'maximised',
      label: 'open maximised',
      type: 'checkbox',
      checked: states.maximised,
      click: () =>
        contextMenu.getMenuItemById('maximised').checked
          ? store.set('maximised', true)
          : store.set('maximised', false)
    },
    {
      id: 'tray',
      label: 'close to tray',
      type: 'checkbox',
      checked: states.tray,
      click: () =>
        contextMenu.getMenuItemById('tray').checked
          ? store.set('tray', true)
          : store.set('tray', false)
    },
    {
      type: 'separator'
    },
    {
      label: '(x) quit',
      role: 'quit'
    }
  ]);
  tray.setContextMenu(contextMenu);

  tray.on('click', function () {
    const win = electron_1.BrowserWindow.getAllWindows()[0];
    if (win.isVisible()) {
      if (win.isMinimized()) {
        win.show();
      } else win.hide();
    } else {
      if (contextMenu.getMenuItemById('maximised').checked) {
        win.maximize();
      } else win.show();
    }
  });

  const hotkey = '___hotkey___'; // will be set by python script
  electron_1.globalShortcut.register(hotkey, () => {
    const windows = electron_1.BrowserWindow.getAllWindows();
    if (windows.some(win => !win.isVisible())) {
      if (contextMenu.getMenuItemById('maximised').checked) {
        windows.forEach(win => win.maximize());
      } else windows.forEach(win => win.show());
    } else windows.forEach(win => win.hide());
  });
}
