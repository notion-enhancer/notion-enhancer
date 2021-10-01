/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/** @module notion-enhancer/api */

/** environment-specific methods and constants */
import * as env from './env.mjs';

/** environment-specific filesystem reading */
const fs = env.name === 'extension' ? await import('./extension-fs.mjs') : {};
/** environment-specific data persistence */
const storage = env.name === 'extension' ? await import('./extension-storage.mjs') : {};

/** helpers for formatting, validating and parsing values */
import * as fmt from './fmt.mjs';
/** interactions with the enhancer's repository of mods */
import * as registry from './registry.mjs';
/** helpers for manipulation of a webpage */
import * as web from './web.mjs';

export { env, fs, storage, fmt, registry, web };
