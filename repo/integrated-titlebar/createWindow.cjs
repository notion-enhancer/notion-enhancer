/*
 * notion-enhancer: integrated titlebar
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function (api, db, __exports, __eval) {
  __eval(`
    const notionRectFromFocusedWindow = getRectFromFocusedWindow;
    getRectFromFocusedWindow = (windowState) => {
      const rect = notionRectFromFocusedWindow(windowState);
      rect.frame = false;
      return rect;
    };
  `);
};

// hide on open
// maybe only do once to hide first window?

// exports.createWindow = (...args) => {
//   warmWindowState.warmedWindow = true;
//   createWindow(...args);
// };
