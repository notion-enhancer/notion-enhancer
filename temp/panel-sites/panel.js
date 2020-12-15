/*
 * panel sites
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (c) 2020 CloudHill
 * under the MIT license
 */

const electron = require('electron')

module.exports = (store) => {
  let iframe;
  const mainWindow = electron.remote.getCurrentWindow();
  const originalUserAgent = mainWindow.webContents.getUserAgent();
  const mobileUserAgent = 
    'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36'

  // bypass x-frame-options 
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = Object.entries(details.responseHeaders)
      .filter( h => !/x-frame-options/i.test(h[0]) );
    callback({
      responseHeaders: Object.fromEntries(responseHeaders)
    });
  });

  // handle opening mobile sites
  function setUserAgent(userAgent) {
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = userAgent;
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
  }

  return {
    onLoad() {
      iframe = document.querySelector('.panel-site');
      if (iframe.hasAttribute('mobile-user-agent'))
        setUserAgent(mobileUserAgent);
    },
    onSwitch() {
      if (iframe.hasAttribute('mobile-user-agent'))
        setUserAgent(originalUserAgent);
    }
  }
}
