/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

const os = require('os'),
  path = require('path'),
  fs = require('fs-extra');

const location = path.resolve(`${os.homedir()}/.notion-enhancer/config`);

// a wrapper for accessing data stored in a JSON file.
module.exports = (file, namespace = '', defaults = {}) => {
  fs.ensureDirSync(location);
  file = path.resolve(`${location}/${file}.json`);
  if (namespace && !namespace.endsWith('.')) namespace += '.';
  defaults = Object.fromEntries(
    Object.keys(defaults).map((key) => [namespace + key, defaults[key]])
  );

  const getData = () => {
      try {
        return fs.readJsonSync(file);
      } catch (err) {
        return {};
      }
    },
    saveData = (data) => fs.writeJsonSync(file, data);
  return {
    get(key) {
      return { ...defaults, ...getData() }[namespace + key];
    },
    set(key, val) {
      const data = { ...defaults, ...getData() };
      data[namespace + key] = val;
      saveData(data);
      return true;
    },
  };
};

function notionRequire(path) {
  return require(`../../${path}`);
}
