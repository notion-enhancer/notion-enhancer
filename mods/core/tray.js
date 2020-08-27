/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 TarasokUA
 * under the MIT license
 */

'use strict';

let tray, enhancer_menu;

module.exports = (store, __exports) => {
  const electron = require('electron'),
    path = require('path'),
    is_mac = process.platform === 'darwin',
    is_win = process.platform === 'win32',
    helpers = require('../../pkg/helpers.js'),
    __notion = helpers.getNotion();

  electron.app.on('ready', () => {
    tray = new electron.Tray(
      is_win
        ? path.resolve(`${__dirname}/icons/windows.ico`)
        : new electron.nativeImage.createFromPath(
            path.resolve(`${__dirname}/icons/mac+linux.png`)
          ).resize({
            width: 16,
            height: 16,
          })
    );

    electron.ipcMain.on('enhancer:set-menu-theme', (event, arg) => {
      if (!enhancer_menu) return;
      enhancer_menu.webContents.send('enhancer:set-menu-theme', arg);
    });
    electron.ipcMain.on('enhancer:get-menu-theme', (event, arg) => {
      electron.webContents
        .getAllWebContents()
        .forEach((webContents) => webContents.send('enhancer:get-menu-theme'));
    });
    electron.ipcMain.on('enhancer:open-extension-menu', openExtensionMenu);

    function calculateWindowPos(width, height) {
      const screen = electron.screen.getDisplayNearestPoint({
        x: tray.getBounds().x,
        y: tray.getBounds().y,
      });
      // left
      if (screen.workArea.x > 0)
        return {
          x: screen.workArea.x,
          y: screen.workArea.height - height,
        };
      // top
      if (screen.workArea.y > 0)
        return {
          x: Math.round(
            tray.getBounds().x + tray.getBounds().width / 2 - width / 2
          ),
          y: screen.workArea.y,
        };
      // right
      if (screen.workArea.width < screen.bounds.width)
        return {
          x: screen.workArea.width - width,
          y: screen.bounds.height - height,
        };
      // bottom
      return {
        x: Math.round(
          tray.getBounds().x + tray.getBounds().width / 2 - width / 2
        ),
        y: screen.workArea.height - height,
      };
    }

    function openExtensionMenu() {
      if (enhancer_menu) return enhancer_menu.show();
      const window_state = require(`${__notion.replace(
        /\\/g,
        '/'
      )}/app/node_modules/electron-window-state/index.js`)({
        file: 'menu-windowstate.json',
        path: helpers.data_folder,
        defaultWidth: 275,
        defaultHeight: 600,
      });
      electron.shell.openExternal(JSON.stringify(window_state));
      enhancer_menu = new electron.BrowserWindow({
        show: true,
        frame: false,
        titleBarStyle: 'hiddenInset',
        x:
          window_state.x ||
          calculateWindowPos(window_state.width, window_state.height).x,
        y:
          window_state.y ||
          calculateWindowPos(window_state.width, window_state.height).y,
        width: window_state.width,
        height: window_state.height,
        webPreferences: {
          preload: path.resolve(`${__dirname}/menu.js`),
          nodeIntegration: true,
          session: electron.session.fromPartition('persist:notion'),
        },
      });
      enhancer_menu.loadURL('enhancement://core/menu.html');
      enhancer_menu.on('close', (e) => {
        window_state.saveState(enhancer_menu);
        enhancer_menu = null;
      });
    }

    const contextMenu = electron.Menu.buildFromTemplate([
      {
        type: 'normal',
        label: 'GitHub',
        click: () => {
          electron.shell.openExternal(
            'https://github.com/dragonwocky/notion-enhancer/blob/master/DOCUMENTATION.md'
          );
        },
      },
      {
        type: 'normal',
        label: 'Discord',
        click: () => {
          electron.shell.openExternal('https://discord.gg/sFWPXtA');
        },
      },
      {
        type: 'separator',
      },
      {
        type: 'normal',
        label: 'Bug Report',
        click: () => {
          electron.shell.openExternal(
            'https://github.com/dragonwocky/notion-enhancer/issues/new?labels=bug&template=bug-report.md'
          );
        },
      },
      {
        type: 'normal',
        label: 'Feature Request',
        click: () => {
          electron.shell.openExternal(
            'https://github.com/dragonwocky/notion-enhancer/issues/new?labels=enhancement&template=feature-request.md'
          );
        },
      },
      {
        type: 'separator',
      },
      {
        type: 'normal',
        label: 'Enhancements',
        accelerator: 'CommandOrControl+E',
        click: openExtensionMenu,
      },
      {
        type: 'normal',
        label: 'New Window',
        click: () => {
          require('./create.js')(
            store,
            require(path.resolve(`${__notion}/app/main/createWindow.js`))
          )(
            '',
            electron.BrowserWindow.getAllWindows().find(
              (win) => win !== enhancer_menu
            )
          );
        },
        accelerator: 'CommandOrControl+Shift+N',
      },
      {
        type: 'normal',
        label: 'Toggle Visibility',
        accelerator: store().hotkey,
        click: toggleWindows,
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
    tray.setToolTip('Notion');

    function showWindows() {
      const windows = electron.BrowserWindow.getAllWindows();
      if (is_mac) electron.app.show();
      if (store().maximized) windows.forEach((win) => [win.maximize()]);
      else windows.forEach((win) => win.show());
      electron.app.focus({ steal: true });
    }
    function hideWindows() {
      const windows = electron.BrowserWindow.getAllWindows();
      windows.forEach((win) => [win.isFocused() && win.blur(), win.hide()]);
      if (is_mac) electron.app.hide();
    }
    function toggleWindows() {
      const windows = electron.BrowserWindow.getAllWindows();
      if (windows.some((win) => win.isVisible())) hideWindows();
      else showWindows();
    }

    tray.on('click', toggleWindows);
    electron.globalShortcut.register(store().hotkey, () => {
      const windows = electron.BrowserWindow.getAllWindows();
      if (windows.some((win) => win.isFocused() && win.isVisible()))
        hideWindows();
      else showWindows();
    });
  });
};
