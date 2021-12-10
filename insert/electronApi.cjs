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
  _fsQueue = new Set(),
  _onDbChangeListeners = [];

// handle leftover cache from prev versions
if (fs.existsSync(_cacheFile) && fs.lstatSync(_cacheFile).isDirectory()) {
  fs.rmdirSync(_cacheFile);
}

const isRenderer = process && process.type === 'renderer';

const getCache = async () => {
    try {
      return fs.readFileSync(_cacheFile);
    } catch (err) {
      await new Promise((res, rej) => setTimeout(res, 50));
      return getCache();
    }
  },
  getData = async () => {
    if (!fs.existsSync(_cacheFile)) {
      fs.writeFileSync(_cacheFile, '{}', 'utf8');
      return {};
    }
    try {
      return JSON.parse(await getCache());
    } catch (err) {
      return {};
    }
  },
  saveData = (data) => fs.writeFileSync(_cacheFile, JSON.stringify(data));

const db = {
  get: async (path, fallback = undefined) => {
    if (!path.length) return fallback;
    while (_fsQueue.size) await new Promise(requestIdleCallback);
    const values = await getData();
    let value = values;
    while (path.length) {
      if (value === undefined) {
        value = fallback;
        break;
      }
      value = value[path.shift()];
    }
    return value ?? fallback;
  },
  set: async (path, value) => {
    if (!path.length) return undefined;
    while (_fsQueue.size) await new Promise(requestIdleCallback);
    const op = Symbol();
    _fsQueue.add(op);
    const pathClone = [...path],
      values = await getData();
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
    _onDbChangeListeners.forEach((listener) => listener({ path: pathClone, new: value, old }));
    _fsQueue.delete(op);
    return value;
  },
  addChangeListener: (callback) => {
    _onDbChangeListeners.push(callback);
  },
  removeChangeListener: (callback) => {
    _onDbChangeListeners = _onDbChangeListeners.filter((listener) => listener !== callback);
  },
};

const ipcRenderer = {
  sendMessage: (channel, data = undefined, namespace = 'notion-enhancer') => {
    const { ipcRenderer } = require('electron');
    channel = namespace ? `${namespace}:${channel}` : channel;
    ipcRenderer.send(channel, data);
  },
  sendMessageToHost: (channel, data = undefined, namespace = 'notion-enhancer') => {
    const { ipcRenderer } = require('electron');
    channel = namespace ? `${namespace}:${channel}` : channel;
    ipcRenderer.sendToHost(channel, data);
  },
  onMessage: (channel, callback, namespace = 'notion-enhancer') => {
    const { ipcRenderer } = require('electron');
    channel = namespace ? `${namespace}:${channel}` : channel;
    ipcRenderer.on(channel, callback);
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
