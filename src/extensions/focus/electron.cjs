/**
 * notion-enhancer: focus
 * (c) 2020 Arecsu
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

module.exports = async (api, db) => {
  const { ipcMain, BrowserWindow } = require("electron"),
    channel = "notion-enhancer:focus";
  // notion's tabs and tab bar are nested views within the window
  // (BrowserWindow.getBrowserViews() no longer returns them)
  const getViews = (view) =>
    view ? [view, ...(view.children ?? []).flatMap(getViews)] : [];
  ipcMain.on(channel, ({ sender }, message) => {
    const window = BrowserWindow.fromWebContents(sender);
    for (const view of getViews(window?.contentView)) {
      if (view.webContents?.isDestroyed() === false) {
        view.webContents.send(channel, message);
      }
    }
  });
};
