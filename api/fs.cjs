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

const fs = require('../env/fs.cjs');

/**
 * transform a path relative to the enhancer root directory into an absolute path
 * @type {function}
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {string} an absolute filepath
 */
module.exports.localPath = fs.localPath;

/**
 * fetch and parse a json file's contents
 * @type {function}
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object} [opts] - the second argument of a fetch() request
 * @returns {object} the json value of the requested file as a js object
 */
module.exports.getJSON = fs.getJSON;

/**
 * fetch a text file's contents
 * @type {function}
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object} [opts] - the second argument of a fetch() request
 * @returns {string} the text content of the requested file
 */
module.exports.getText = fs.getText;

/**
 * check if a file exists
 * @type {function}
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {boolean} whether or not the file exists
 */
module.exports.isFile = fs.isFile;
