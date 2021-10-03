/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/**
 * environment-specific filesystem reading
 * @module notion-enhancer/api/fs
 */

import * as fs from '../env/fs.mjs';

/**
 * transform a path relative to the enhancer root directory into an absolute path
 * @type {function}
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {string} an absolute filepath
 */
export const localPath = fs.localPath;

/**
 * fetch and parse a json file's contents
 * @type {function}
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object} [opts] - the second argument of a fetch() request
 * @returns {object} the json value of the requested file as a js object
 */
export const getJSON = fs.getJSON;

/**
 * fetch a text file's contents
 * @type {function}
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object} [opts] - the second argument of a fetch() request
 * @returns {string} the text content of the requested file
 */
export const getText = fs.getText;

/**
 * check if a file exists
 * @type {function}
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {boolean} whether or not the file exists
 */
export const isFile = fs.isFile;
