/**
 * notion-enhancer: topbar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

module.exports = async ({}, db) => {
  const { ipcMain, BrowserWindow } = require("electron");
  ipcMain.on("notion-enhancer:topbar", ({ sender }, message) => {
    const window = BrowserWindow.fromWebContents(sender);
    if (message === "pin-always-on-top") window.setAlwaysOnTop(true);
    if (message === "unpin-always-on-top") window.setAlwaysOnTop(false);
  });
};
