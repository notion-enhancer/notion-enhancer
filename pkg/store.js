/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (https://dragonwocky.me/) under the MIT license
 */

// a wrapper for accessing data stored in a JSON file.

const path = require('path'),
  fs = require('fs-extra'),
  { getJSON, data_folder } = require('./helpers.js');

module.exports = (namespace, defaults = {}) => {
  namespace = path.join(data_folder, 'data', namespace + '.json');
  fs.ensureDirSync(path.join(data_folder, 'data'));

  const getData = () => ({ ...defaults, ...getJSON(namespace) });
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
