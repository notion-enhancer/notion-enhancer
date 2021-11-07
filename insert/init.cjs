/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const api = require('notion-enhancer/api/_.cjs');

module.exports = async function (target, __exports) {
  if (target === 'renderer/preload') {
    require('notion-enhancer/electronApi.cjs');
    document.addEventListener('readystatechange', (event) => {
      if (document.readyState !== 'complete') return false;
      const script = document.createElement('script');
      script.type = 'module';
      script.src = api.fs.localPath('client.mjs');
      document.head.appendChild(script);
    });
  }

  if (target === 'main/main') {
    const { app } = require('electron');
    app.whenReady().then(require('notion-enhancer/worker.cjs').listen);
  }
};
