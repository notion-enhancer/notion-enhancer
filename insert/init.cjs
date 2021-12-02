/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

module.exports = async function (target, __exports, __eval) {
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

  const api = require('notion-enhancer/api/index.cjs'),
    { registry } = api;
  for (const mod of await registry.list((mod) => registry.enabled(mod.id))) {
    for (const { source, target: scriptTarget } of (mod.js ? mod.js.electron : []) || []) {
      if (`${target}.js` !== scriptTarget) continue;
      const script = require(`notion-enhancer/repo/${mod._dir}/${source}`);
      script(api, await registry.db(mod.id), __exports, __eval);
    }
  }
};
