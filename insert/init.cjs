/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const api = require('notion-enhancer/api/_.cjs');

module.exports = async function (target, __exports) {
  if (target === 'renderer/preload') {
    window.__enhancerElectronApi = {
      platform: process.platform,
      version: require('notion-enhancer/package.json').version,
      db: {
        get: api.storage.get,
        set: api.storage.set,
        addChangeListener: api.storage.addChangeListener,
        removeChangeListener: api.storage.removeChangeListener,
      },
      sendMessage: (message) => {},
    };

    document.addEventListener('readystatechange', (event) => {
      if (document.readyState !== 'complete') return false;
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'notion://www.notion.so/__notion-enhancer/client.mjs';
      document.head.appendChild(script);
    });
  }
};
