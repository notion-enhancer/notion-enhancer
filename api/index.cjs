/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/** @module notion-enhancer/api */

module.exports = {
  /** environment-specific methods and constants */
  env: require('notion-enhancer/api/node/env.cjs'),
  /** environment-specific file reading */
  fs: require('notion-enhancer/api/node/fs.cjs'),
  /** environment-specific data persistence */
  storage: require('notion-enhancer/api/node/storage.cjs'),
  /** helpers for formatting, validating and parsing values */
  fmt: require('notion-enhancer/api/node/fmt.cjs'),
  /** interactions with the enhancer's repository of mods */
  registry: require('notion-enhancer/api/node/registry.cjs'),
};
