/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/** @module notion-enhancer/api */

/** environment-specific methods and constants */
export * as env from './client/env.mjs';
/** environment-specific file reading */
export * as fs from './client/fs.mjs';
/** environment-specific data persistence */
export * as storage from './client/storage.mjs';

/** a basic wrapper around notion's unofficial api */
export * as notion from './client/notion.mjs';
/** helpers for formatting, validating and parsing values */
export * as fmt from './client/fmt.mjs';
/** interactions with the enhancer's repository of mods */
export * as registry from './client/registry.mjs';
/** helpers for manipulation of a webpage */
export * as web from './client/web.mjs';
/** shared notion-style elements */
export * as components from './client/components/index.mjs';
