/**
 * notion-enhancer: titlebar
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

"use strict";

module.exports = async ({}, db) => {
  Object.assign((globalThis.__notionConfig ??= {}), {
    titlebarStyle: "hidden",
  });

  const { ipcMain, BrowserWindow } = require("electron");
  ipcMain.on("notion-enhancer:titlebar", ({ sender }, message) => {
    const window = BrowserWindow.fromWebContents(sender);
    if (message === "minimize") window.minimize();
    if (message === "maximize") window.maximize();
    if (message === "unmaximize") window.unmaximize();
    if (message === "close") window.close();
  });

  ipcMain.handle("notion-enhancer:titlebar", ({ sender }, message) => {
    if (message?.query !== "is-maximized") return;
    const window = BrowserWindow.fromWebContents(sender);
    return window.isMaximized();
  });
};
