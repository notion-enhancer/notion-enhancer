/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
 * (c) 2020 TarasokUA
 * (https://dragonwocky.me/) under the MIT license
 */

// a wrapper for accessing data stored in a JSON file.
// editing this WILL break things if you don't know what you're doing.

const path = require('path'),
  fs = require('fs');

function getJSON(from) {
  try {
    return JSON.parse(fs.readFileSync(from));
  } catch {
    return {};
  }
}

module.exports = (opts) => {
  opts = {
    config: 'user-preferences',
    defaults: {},
    ...opts,
  };
  const config = path.join(__dirname, opts.config + '.json');
  return new Proxy(
    {},
    {
      get(obj, prop) {
        obj = { ...opts.defaults, ...getJSON(config) };
        return obj[prop];
      },
      set(obj, prop, val) {
        obj = { ...opts.defaults, ...getJSON(config) };
        obj[prop] = val;
        fs.writeFileSync(config, JSON.stringify(obj));
        return true;
      },
    }
  );
};
