/*
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const api = require('notion-enhancer/api/_.cjs');

window.__enhancerElectronApi = {
  platform: api.env.name,
  version: api.env.version,
  db: {
    get: api.storage.get,
    set: api.storage.set,
    addChangeListener: api.storage.addChangeListener,
    removeChangeListener: api.storage.removeChangeListener,
  },
  sendMessage: (id, data = undefined) => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send(`notion-enhancer:${id}`, data);
  },
  onMessage: (id, callback) => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.on(`notion-enhancer:${id}`, callback);
  },
};
