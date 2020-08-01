/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

'use strict';

const path = require('path'),
  fs = require('fs-extra'),
  { getJSON, data_folder } = require('./helpers.js');

// a wrapper for accessing data stored in a JSON file.
module.exports = (namespace, defaults = {}) => {
  namespace = path.resolve(`${data_folder}/${namespace}.json`);
  fs.ensureDirSync(data_folder);

  const getData = () => ({ ...defaults, ...getJSON(namespace) });
  // fs.writeJsonSync(namespace, getData());

  return new Proxy(defaults, {
    get(obj, prop) {
      obj = getData();
      return obj[prop];
    },
    set(obj, prop, val) {
      obj = getData();
      obj[prop] = val;
      fs.writeJsonSync(namespace, obj);
      return true;
    },
  });
};
