/*
 * Notion Enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

// a wrapper for accessing data stored in a JSON file

const path = require('path'),
  fs = require('fs');

class Store {
  constructor(opts) {
    this.path = path.join(__dirname, opts.config + '.json');
    this.data = parseDataFile(this.path, opts.defaults);
  }
  get(key) {
    return this.data[key];
  }
  set(key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(path, defaults) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch (error) {
    return defaults;
  }
}

module.exports = Store;
