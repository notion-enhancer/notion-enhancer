/**
 * notion-enhancer: tabs
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function (api, db, __exports, __eval) {
  const notionCreateWindow = __exports.createWindow;
  __exports.createWindow = (relativeUrl = '', args) => {
    const windows = api.electron.getNotionWindows();
    // '/' is used to create new windows intentionally
    if (relativeUrl && relativeUrl !== '/' && windows.length) {
      const window = api.electron.getFocusedNotionWindow() || windows[0];
      window.webContents.send('notion-enhancer:open-tab', {
        notionUrl: `notion://www.notion.so${relativeUrl}`,
      });
      return window;
    }
    return notionCreateWindow(relativeUrl, args);
  };
};
