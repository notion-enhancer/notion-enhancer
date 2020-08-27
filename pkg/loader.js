/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/) (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  helpers = require('./helpers.js'),
  store = require('./store.js');

let __notion = helpers.getNotion();
module.exports = function (__file, __exports) {
  __file = __file
    .slice(path.resolve(`${__notion}/app`).length + 1)
    .replace(/\\/g, '/');

  if (__file === 'main/main.js') {
    const electron = require('electron');
    electron.app.whenReady().then(() => {
      electron.session
        .fromPartition('persist:notion')
        .protocol.registerFileProtocol('enhancement', (req, callback) => {
          callback({
            path: path.resolve(
              `${__dirname}/../mods/${req.url.slice('enhancement://'.length)}`
            ),
          });
        });
    });
  }

  const modules = helpers.getEnhancements();
  for (let mod of modules.loaded) {
    if (
      (mod.tags || []).includes('core') ||
      store('mods', { [mod.id]: { enabled: false } })[mod.id].enabled
    ) {
      if (
        __file === 'renderer/preload.js' &&
        fs.pathExistsSync(
          path.resolve(`${__dirname}/../mods/${mod.dir}/styles.css`)
        )
      ) {
        document.addEventListener('readystatechange', (event) => {
          if (document.readyState !== 'complete') return false;
          const style = document.createElement('link');
          style.rel = 'stylesheet';
          style.href = `enhancement://${mod.dir}/styles.css`;
          document.querySelector('head').appendChild(style);
        });
      }
      if (mod.hacks && mod.hacks[__file]) {
        mod.defaults = {};
        for (let opt of mod.options || [])
          mod.defaults[opt.key] = Array.isArray(opt.value)
            ? opt.value[0]
            : opt.value;
        mod.hacks[__file](
          (...args) =>
            !args.length
              ? store(mod.id, mod.defaults)
              : args.length === 1
              ? store(mod.id, { ...mod.defaults, ...args[0] })
              : store(args[0], { ...mod.defaults, ...args[1] }),
          __exports
        );
      }
    }
  }
};
