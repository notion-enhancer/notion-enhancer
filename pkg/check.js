/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';
const fs = require('fs-extra'),
  path = require('path'),
  helpers = require('./helpers.js'),
  { version } = require('../package.json');

// handle pre-existing installations: app.asar modded? with which enhancer version?

let __notion = helpers.getNotion();
module.exports = async function () {
  const version_path = path.resolve(`${__notion}/app/ENHANCER_VERSION.txt`),
    installed_version = (await fs.pathExists(version_path))
      ? await fs.readFile(version_path, 'utf8')
      : '?.?.?';
  if (await fs.pathExists(path.resolve(`${__notion}/app.asar`))) {
    return {
      msg: `notion-enhancer has not been applied.`,
      code: 0,
    };
  }
  return installed_version === version
    ? {
        msg: `notion-enhancer v${version} applied.`,
        code: 1,
      }
    : {
        msg: `notion-enhancer v${installed_version} found applied != v${version} package.`,
        code: 2,
      };
};
