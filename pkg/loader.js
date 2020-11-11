/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/) (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  { __notion, getEnhancements, createElement } = require('./helpers.js'),
  store = require('./store.js');

module.exports = function (__file, __exports) {
  __file = __file
    .slice(path.resolve(`${__notion}/app`).length + 1)
    .replace(/\\/g, '/');

  if (__file === 'main/security.js') {
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
    electron.protocol.registerSchemesAsPrivileged([
      {
        scheme: 'notion',
        privileges: {
          standard: true,
          secure: true,
          allowServiceWorkers: true,
          supportFetchAPI: true,
          corsEnabled: true,
        },
      },
      {
        scheme: 'enhancement',
        privileges: {
          standard: true,
          secure: true,
          allowServiceWorkers: true,
          supportFetchAPI: true,
          corsEnabled: true,
          bypassCSP: true,
        },
      },
    ]);
  }

  let modules = getEnhancements();
  modules = [
    ...modules.loaded.filter((m) => m.tags.includes('core')),
    ...modules.loaded.filter((m) => !m.tags.includes('core')).reverse(),
  ];
  if (__file === 'renderer/preload.js') {
    document.addEventListener('readystatechange', (event) => {
      if (document.readyState !== 'complete') return false;
      for (let mod of modules) {
        if (
          (mod.alwaysActive ||
            store('mods', { [mod.id]: { enabled: false } })[mod.id].enabled)
        ) {
          const fileExists = (file) => fs.pathExistsSync(
              path.resolve(file)
          )
          for (let sheet of ['app', 'variables']) {
            if (fileExists(`${__dirname}/../mods/${mod.dir}/${sheet}.css`)) {
              document.head.appendChild(
                createElement(
                  `<link rel="stylesheet" href="enhancement://${mod.dir}/${sheet}.css">`
                )
              );
            }
          }
        }
      }
    });
  }
  for (let mod of modules) {
    if (
      (mod.alwaysActive ||
        store('mods', { [mod.id]: { enabled: false } })[mod.id].enabled) &&
      mod.hacks &&
      mod.hacks[__file]
    ) {
      mod.hacks[__file]((...args) => {
        if (!args.length) return store(mod.id, mod.defaults);
        if (args.length === 1 && typeof args[0] === 'object')
          return store(mod.id, { ...mod.defaults, ...args[0] });
        const other_mod = modules.find((m) => m.id === args[0]);
        return store(args[0], {
          ...(other_mod ? other_mod.defaults : {}),
          ...(args[1] || {}),
        });
      }, __exports);
    }
  }
};
