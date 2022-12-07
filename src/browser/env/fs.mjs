/*
 * notion-enhancer: api
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

'use strict';

/** environment-specific file reading */

/**
 * transform a path relative to the enhancer root directory into an absolute path
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {string} an absolute filepath
 */
export const localPath = chrome.runtime.getURL;

/**
 * fetch and parse a json file's contents
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object=} opts - the second argument of a fetch() request
 * @returns {object} the json value of the requested file as a js object
 */
export const getJSON = (path, opts = {}) =>
  fetch(path.startsWith('http') ? path : localPath(path), opts).then((res) => res.json());

/**
 * fetch a text file's contents
 * @param {string} path - a url or within-the-enhancer filepath
 * @param {object=} opts - the second argument of a fetch() request
 * @returns {string} the text content of the requested file
 */
export const getText = (path, opts = {}) =>
  fetch(path.startsWith('http') ? path : localPath(path), opts).then((res) => res.text());

/**
 * check if a file exists
 * @param {string} path - a url or within-the-enhancer filepath
 * @returns {boolean} whether or not the file exists
 */
export const isFile = async (path) => {
  try {
    await fetch(path.startsWith('http') ? path : localPath(path));
    return true;
  } catch {
    return false;
  }
};
