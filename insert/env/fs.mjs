/**
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * environment-specific file reading
 * @module notion-enhancer/api/fs
 */

/**
 * transform a path relative to the enhancer root directory into an absolute path
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {string} an absolute filepath
 */
export const localPath = (path) => `notion://www.notion.so/__notion-enhancer/${path}`;

/**
 * fetch and parse a json file's contents
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object} [opts] - the second argument of a fetch() request
 * @returns {object} the json value of the requested file as a js object
 */
export const getJSON = (path, opts = {}) => {
  if (path.startsWith('http')) return fetch(path, opts).then((res) => res.json());
  try {
    return globalThis.__enhancerElectronApi.nodeRequire(`notion-enhancer/${path}`);
  } catch (err) {
    return fetch(localPath(path), opts).then((res) => res.json());
  }
};

/**
 * fetch a text file's contents
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object} [opts] - the second argument of a fetch() request
 * @returns {string} the text content of the requested file
 */
export const getText = (path, opts = {}) => {
  if (path.startsWith('http')) return fetch(path, opts).then((res) => res.text());
  try {
    const fs = globalThis.__enhancerElectronApi.nodeRequire('fs'),
      { resolve: resolvePath } = globalThis.__enhancerElectronApi.nodeRequire('path');
    return fs.readFileSync(resolvePath(`${__dirname}/../../${path}`));
  } catch (err) {
    return fetch(localPath(path), opts).then((res) => res.text());
  }
};

/**
 * check if a file exists
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {boolean} whether or not the file exists
 */
export const isFile = async (path) => {
  try {
    const fs = globalThis.__enhancerElectronApi.nodeRequire('fs'),
      { resolve: resolvePath } = globalThis.__enhancerElectronApi.nodeRequire('path');
    if (path.startsWith('http')) {
      await fetch(path);
    } else {
      try {
        fs.existsSync(resolvePath(`${__dirname}/../../${path}`));
      } catch (err) {
        await fetch(localPath(path));
      }
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * get an absolute path to files within notion
 * @param {string} path - relative to the root notion/resources/app/ e.g. renderer/search.js
 * @runtime electron
 */
export const notionPath = globalThis.__enhancerElectronApi.notionPath;
