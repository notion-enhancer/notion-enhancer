/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

const os = require('os'),
  path = require('path'),
  fs = require('fs'),
  _cacheFile = path.resolve(`${os.homedir()}/.notion-enhancer`),
  _fsQueue = [],
  _onDbChangeListeners = [];

// handle leftover cache from prev versions
if (fs.existsSync(_cacheFile) && fs.lstatSync(_cacheFile).isDirectory()) {
  fs.rmdirSync(_cacheFile);
}
if (!fs.existsSync(_cacheFile)) fs.writeFileSync(_cacheFile, '{}', 'utf8');

const isRenderer = process && process.type === 'renderer';

const getData = () => {
    try {
      return JSON.parse(fs.readFileSync(_cacheFile));
    } catch (err) {
      return {};
    }
  },
  saveData = (data) => fs.writeFileSync(_cacheFile, JSON.stringify(data));

const db = {
  get: (path, fallback = undefined) => {
    if (!path.length) return fallback;
    const values = getData();
    let value = values;
    while (path.length) {
      if (value === undefined) {
        value = fallback;
        break;
      }
      value = value[path.shift()];
    }
    return Promise.resolve(value ?? fallback);
  },
  set: (path, value) => {
    if (!path.length) return undefined;
    const precursor = _fsQueue[_fsQueue.length - 1] || undefined,
      interaction = new Promise(async (res, rej) => {
        if (precursor !== undefined) {
          await precursor;
          _fsQueue.shift();
        }
        const pathClone = [...path],
          values = getData();
        let pointer = values,
          old;
        while (path.length) {
          const key = path.shift();
          if (!path.length) {
            old = pointer[key];
            pointer[key] = value;
            break;
          }
          pointer[key] = pointer[key] ?? {};
          pointer = pointer[key];
        }
        saveData(values);
        _onDbChangeListeners.forEach((listener) =>
          listener({ path: pathClone, new: value, old })
        );
        res(value);
      });
    _fsQueue.push(interaction);
    return interaction;
  },
  addChangeListener: (callback) => {
    _onDbChangeListeners.push(callback);
  },
  removeChangeListener: (callback) => {
    _onDbChangeListeners = _onDbChangeListeners.filter((listener) => listener !== callback);
  },
};

const ipcRenderer = {
  sendMessage: (channel, data = undefined) => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.send(`notion-enhancer:${channel}`, data);
  },
  sendMessageToHost: (channel, data = undefined) => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.sendToHost(`notion-enhancer:${channel}`, data);
  },
  onMessage: (channel, callback) => {
    const { ipcRenderer } = require('electron');
    ipcRenderer.on(`notion-enhancer:${channel}`, callback);
  },
};

globalThis.__enhancerElectronApi = {
  platform: process.platform,
  version: require('notion-enhancer/package.json').version,
  db,

  browser: isRenderer ? require('electron').remote.getCurrentWindow() : {},
  webFrame: isRenderer ? require('electron').webFrame : {},
  notionRequire: (path) => require(`../../${path}`),
  notionPath: (path) => require('path').resolve(`${__dirname}/../../${path}`),
  nodeRequire: (path) => require(path),

  focusMenu: () => {
    if (isRenderer) return ipcRenderer.sendMessage('focusMenu');
    const { focusMenu } = require('notion-enhancer/worker.cjs');
    return focusMenu();
  },
  focusNotion: () => {
    if (isRenderer) return ipcRenderer.sendMessage('focusNotion');
    const { focusNotion } = require('notion-enhancer/worker.cjs');
    return focusNotion();
  },
  reload: () => {
    if (isRenderer) return ipcRenderer.sendMessage('reload');
    const { reload } = require('notion-enhancer/worker.cjs');
    return reload();
  },

  ipcRenderer,
};
