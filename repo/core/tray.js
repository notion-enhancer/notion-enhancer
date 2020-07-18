/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

let tray;

module.exports = (defaults) =>
  function (store) {
    const electron = require('electron'),
      path = require('path'),
      is_mac = process.platform === 'darwin',
      is_win = process.platform === 'win32',
      settings = store(defaults);

    electron.app.on('ready', () => {
      tray = new electron.Tray(
        is_win
          ? path.normalize(`${__dirname}/windows.ico`)
          : new electron.nativeImage.createFromPath(
              path.normalize(`${__dirname}/mac+linux.png`)
            ).resize({
              width: 16,
              height: 16,
            })
      );

      const contextMenu = electron.Menu.buildFromTemplate([
        {
          type: 'normal',
          label: 'Bug Report',
        },
        {
          type: 'normal',
          label: 'Feature Request',
        },
        {
          type: 'separator',
        },
        {
          type: 'normal',
          label: 'Docs',
        },
        {
          type: 'normal',
          label: 'Enhancements',
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
        if (settings.maximized) windows.forEach((win) => [win.maximize()]);
        else windows.forEach((win) => win.show());
        electron.app.focus({ steal: true });
      }
      function hideWindows() {
        const windows = electron.BrowserWindow.getAllWindows();
        windows.forEach((win) => [win.isFocused() && win.blur(), win.hide()]);
        if (is_mac) electron.app.hide();
      }
      tray.on('click', () => {
        const windows = electron.BrowserWindow.getAllWindows();
        if (windows.some((win) => win.isVisible())) hideWindows();
        else showWindows();
      });
      electron.globalShortcut.register(settings.hotkey, () => {
        const windows = electron.BrowserWindow.getAllWindows();
        if (windows.some((win) => win.isFocused() && win.isVisible()))
          hideWindows();
        else showWindows();
      });
    });
  };
