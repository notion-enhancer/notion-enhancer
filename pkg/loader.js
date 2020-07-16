/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';
const fs = require('fs-extra'),
  path = require('path'),
  helpers = require('./helpers.js');

let __notion = helpers.getNotion();
module.exports = async function (__file) {
  __notion = await __notion;
  __file = __file
    .slice(path.resolve(__notion, 'app').length + 1)
    .replace(/\\/g, '/');

  const mods = await fs.readdir(path.resolve(__dirname, '..', 'mods')),
    invalid_mods = [],
    loaded_mods = [];
  for (let dir of mods) {
    try {
      const mod = require(`../mods/${dir}/mod.js`);
      if (
        !mod.id ||
        !mod.name ||
        !mod.version ||
        !mod.author ||
        !['extension', 'theme', 'core'].includes(mod.type)
      )
        throw Error;
      loaded_mods.push(mod.name);
    } catch (err) {
      invalid_mods.push(dir);
    }
  }

  if (__file === 'renderer/preload.js') {
    if (loaded_mods.length)
      console.info(
        `<notion-enhancer> enhancements loaded: ${loaded_mods.join(', ')}.`
      );
    if (invalid_mods.length)
      console.error(
        `<notion-enhancer> invalid mods found: ${invalid_mods.join(', ')}.`
      );
  }
};
