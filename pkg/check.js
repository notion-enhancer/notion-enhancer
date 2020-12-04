/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/) (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  helpers = require('./helpers.js'),
  { version } = require('../package.json'),
  pathExists = (filepath) => fs.pathExists(path.resolve(filepath));

module.exports = async function () {
  const version_path = `${helpers.__notion}/app/ENHANCER_VERSION.txt`;
  if (!(await pathExists(version_path))) {
    return {
      msg: `notion-enhancer has not been applied.`,
      code: 0,
    };
  }
  const installed_version = await fs.readFile(version_path, 'utf8'),
    packed = await pathExists(`${helpers.__notion}/app.asar`),
    backup = packed
      ? (await pathExists(`${helpers.__notion}/app.asar.bak`))
        ? `${helpers.__notion}/app.asar.bak`
        : undefined
      : (await pathExists(`${helpers.__notion}/app.bak`))
      ? `${helpers.__notion}/app.bak`
      : undefined;
  return installed_version === version
    ? {
        msg: `notion-enhancer v${version} applied.`,
        version: installed_version,
        packed,
        backup,
        code: 1,
      }
    : {
        msg: `notion-enhancer v${installed_version} found applied != v${version} package.`,
        version: installed_version,
        packed,
        backup,
        code: 2,
      };
};
