/**
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/** @module notion-enhancer/api */

// compiles to .cjs for use in electron:
// npx -y esbuild insert/api/index.mjs --bundle --format=cjs --outfile=insert/api/index.cjs

/** environment-specific methods and constants */
export * as env from './env.mjs';
/** environment-specific file reading */
export * as fs from './fs.mjs';
/** environment-specific data persistence */
export * as storage from './storage.mjs';

/** access to electron renderer apis */
export * as electron from './electron.mjs';

/** a basic wrapper around notion's unofficial api */
// export * as notion from './notion.mjs';
/** helpers for formatting, validating and parsing values */
export * as fmt from './fmt.mjs';
/** interactions with the enhancer's repository of mods */
export * as registry from './registry.mjs';
/** helpers for manipulation of a webpage */
export * as web from './web.mjs';
/** shared notion-style elements */
export * as components from './components/index.mjs';
