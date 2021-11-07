/*
 * notion-enhancer core: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';
module.exports = {};

/**
 * environment-specific file reading
 * @module notion-enhancer/api/fs
 */

const fs = require('fs'),
  { resolve: resolvePath } = require('path');

/**
 * transform a path relative to the enhancer root directory into an absolute path
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {string} an absolute filepath
 */
module.exports.localPath = (path) => `notion://www.notion.so/__notion-enhancer/${path}`;

/**
 * fetch and parse a json file's contents
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object} [opts] - the second argument of a fetch() request
 * @returns {object} the json value of the requested file as a js object
 */
module.exports.getJSON = (path, opts = {}) => {
  if (path.startsWith('http')) return fetch(path, opts).then((res) => res.json());
  return require(`notion-enhancer/${path}`);
};

/**
 * fetch a text file's contents
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object} [opts] - the second argument of a fetch() request
 * @returns {string} the text content of the requested file
 */
module.exports.getText = (path, opts = {}) => {
  if (path.startsWith('http')) return fetch(path, opts).then((res) => res.text());
  return fs.readFileSync(resolvePath(`${__dirname}/../../${path}`));
};

/**
 * check if a file exists
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {boolean} whether or not the file exists
 */
module.exports.isFile = async (path) => {
  try {
    if (path.startsWith('http')) {
      await fetch(path);
    } else fs.existsSync(resolvePath(`${__dirname}/../../${path}`));
    return true;
  } catch {
    return false;
  }
};
