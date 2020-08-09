/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const path = require('path'),
  fs = require('fs-extra'),
  { getJSON, data_folder } = require('./helpers.js');

// a wrapper for accessing data stored in a JSON file.
module.exports = (namespace, defaults = {}) => {
  namespace = path.resolve(`${data_folder}/${namespace}.json`);
  fs.ensureDirSync(data_folder);

  let data;
  const saveData = () => fs.writeJsonSync(namespace, data),
    handler = {
      get(obj, prop) {
        if (prop === 'isProxy') return true;
        if (
          typeof obj[prop] === 'object' &&
          obj[prop] !== null &&
          !obj[prop].isProxy
        )
          obj[prop] = new Proxy(obj[prop], handler);
        return obj[prop];
      },
      set(obj, prop, val) {
        obj[prop] = val;
        saveData();
        return true;
      },
    };
  data = new Proxy({ ...defaults, ...getJSON(namespace) }, handler);
  return data;
};
