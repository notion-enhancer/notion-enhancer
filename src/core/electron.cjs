/**
 * notion-enhancer
 * (c) 2024 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

const getPreference = (key) => {
    const { preferences = {} } = globalThis.__notionStore?.getState()?.app;
    return preferences[key];
  },
  setPreference = (key, value) => {
    const action = globalThis.__updatePreferences?.({ [key]: value });
    globalThis.__notionStore?.dispatch?.(action);
  };

module.exports = async ({}, db) => {
  const toggleWindowHotkey = await db.get("toggleWindowHotkey"),
    developerMode = await db.get("developerMode"),
    draggableTabs = await db.get("draggableTabs");

  // experimental: enable tab reordering from notion's hidden preferences
  setPreference("isDraggableTabsEnabled", draggableTabs);

  // enable developer mode, access extra debug tools
  Object.assign((globalThis.__notionConfig ??= {}), {
    env: developerMode ? "development" : "production",
  });

  // listen for the global window toggle hotkey
  const { app, globalShortcut, BrowserWindow } = require("electron");
  app.whenReady().then(() => {
    globalShortcut.register(toggleWindowHotkey, () => {
      const windows = BrowserWindow.getAllWindows()
          // filter out quick search window
          .filter((win) => win.fullScreenable),
        focused = windows.some((win) => win.isFocused() && win.isVisible());
      windows.forEach((win) =>
        // check if notion is set to run in the background
        getPreference("isHideLastWindowOnCloseEnabled")
          ? focused
            ? win.hide()
            : win.show()
          : focused
          ? win.minimize()
          : win.isMinimized()
          ? win.restore()
          : win.focus()
      );
    });
  });
};
