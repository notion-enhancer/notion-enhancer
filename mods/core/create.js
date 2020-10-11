/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 TarasokUA
 * under the MIT license
 */

'use strict';

module.exports = (store, __exports) => {
  const electron = require('electron'),
    allWindows = () =>
      electron.BrowserWindow.getAllWindows().filter(
        (win) => win.getTitle() !== 'notion-enhancer menu'
      ),
    // createWindow = __exports.createWindow,
    path = require('path'),
    helpers = require('../../pkg/helpers.js');

  __exports.createWindow = function (relativeUrl, focused_window) {
    if (!relativeUrl) relativeUrl = '';
    const window_state = require(`${helpers.__notion.replace(
        /\\/g,
        '/'
      )}/app/node_modules/electron-window-state/index.js`)({
        defaultWidth: 1320,
        defaultHeight: 860,
      }),
      rect = {
        x: window_state.x,
        y: window_state.y,
        width: window_state.width,
        height: window_state.height,
      };
    focused_window =
      focused_window || electron.BrowserWindow.getFocusedWindow();
    if (focused_window && !focused_window.isMaximized()) {
      rect.x = focused_window.getPosition()[0] + 20;
      rect.y = focused_window.getPosition()[1] + 20;
      rect.width = focused_window.getSize()[0];
      rect.height = focused_window.getSize()[1];
    }
    const window = new electron.BrowserWindow({
      show: false,
      backgroundColor: '#ffffff',
      titleBarStyle: 'hiddenInset',
      frame: !store().frameless,
      webPreferences: {
        preload: path.resolve(`${helpers.__notion}/app/renderer/index.js`),
        webviewTag: true,
        session: electron.session.fromPartition('persist:notion'),
      },
      ...rect,
    });
    electron.session
      .fromPartition('persist:notion')
      .webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' enhancement: https://gist.github.com https://apis.google.com https://api.amplitude.com https://widget.intercom.io https://js.intercomcdn.com https://logs-01.loggly.com https://cdn.segment.com https://analytics.pgncs.notion.so https://checkout.stripe.com https://embed.typeform.com https://admin.typeform.com https://platform.twitter.com https://cdn.syndication.twimg.com; connect-src 'self' https://msgstore.www.notion.so wss://msgstore.www.notion.so https://notion-emojis.s3-us-west-2.amazonaws.com https://s3-us-west-2.amazonaws.com https://s3.us-west-2.amazonaws.com https://notion-production-snapshots-2.s3.us-west-2.amazonaws.com https: http: https://api.amplitude.com https://api.embed.ly https://js.intercomcdn.com https://api-iam.intercom.io wss://nexus-websocket-a.intercom.io https://logs-01.loggly.com https://api.segment.io https://api.pgncs.notion.so https://checkout.stripe.com https://cdn.contentful.com https://preview.contentful.com https://images.ctfassets.net https://api.unsplash.com https://boards-api.greenhouse.io; font-src 'self' data: https://cdnjs.cloudflare.com https://js.intercomcdn.com; img-src 'self' data: blob: https: https://platform.twitter.com https://syndication.twitter.com https://pbs.twimg.com https://ton.twimg.com; style-src 'self' 'unsafe-inline' enhancement: https://cdnjs.cloudflare.com https://github.githubassets.com https://platform.twitter.com https://ton.twimg.com; frame-src https: http:; media-src https: http:",
            ],
          },
        });
      });
    window.once('ready-to-show', function () {
      if (
        !store().openhidden ||
        allWindows().some((win) => win.isVisible() && win.id != window.id)
      ) {
        window.show();
        window.focus();
        if (store().maximized) window.maximize();
        if (
          (focused_window && focused_window.isFullScreen()) ||
          window_state.isFullScreen
        )
          window.setFullScreen(true);
      }
    });
    let intended_quit = false;
    window.on('close', (e) => {
      if (intended_quit || !store().close_to_tray || allWindows().length > 1) {
        window_state.saveState(window);
        window = null;
      } else {
        e.preventDefault();
        window.hide();
      }
    });
    electron.app.on('before-quit', () => (intended_quit = true));
    window.loadURL(__exports.getIndexUrl(relativeUrl));
    window.webContents.openDevTools();
    return window;
  };
  return __exports.createWindow;
};
