/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

const helpers = require('./helpers.js'),
  store = require('./store.js');

module.exports = function (target, __exports) {
  for (let mod of [
    ...helpers.enhancements.list().core,
    ...helpers.enhancements.list().cache.reverse(),
  ])
    if (helpers.enhancements.enabled(mod.id) && mod.hacks && mod.hacks[target])
      mod.hacks[target](
        __exports,
        (defaults = {}) => store('config', mod.id, defaults),
        { ...helpers, directStore: store }
      );
};
