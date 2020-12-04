/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/) (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  { getNotionResources } = require('./helpers.js'),
  { version } = require('../package.json');

module.exports = async function () {
  const __notion = getNotionResources(),
    resolvePath = (filepath) => path.resolve(`${__notion}/${filepath}`),
    pathExists = (filepath) => fs.pathExists(resolvePath(filepath)),
    version_path = 'app/ENHANCER_VERSION.txt',
    packed = await pathExists('app.asar.bak');
  let backup = packed
    ? (await pathExists('app.asar.bak'))
      ? `app.asar.bak`
      : undefined
    : (await pathExists('app.bak'))
    ? 'app.bak'
    : undefined;
  if (!(await pathExists(version_path))) {
    let executable = (await pathExists('app'))
      ? 'app'
      : (await pathExists('app.asar'))
      ? 'app.asar'
      : undefined;
    if (!executable && backup) {
      backup = resolvePath(backup);
      executable = backup.replace(/\.bak$/, '');
      await fs.move(backup, executable);
    } else executable = executable ? resolvePath(executable) : '';
    return executable
      ? {
          code: 0,
          msg: `notion-enhancer has not been applied.`,
          executable,
        }
      : {
          code: 1,
          msg: `notion installation has been corrupted: no executable found.`,
        };
  }
  const installed_version = await fs.readFile(
      resolvePath(version_path),
      'utf8'
    ),
    meta = {
      version: installed_version,
      executable: resolvePath('app'),
      packed: resolvePath(packed),
      backup: resolvePath(backup),
    };
  return installed_version === version
    ? {
        code: 2,
        msg: `notion-enhancer v${version} applied.`,
        ...meta,
      }
    : {
        code: 3,
        msg: `notion-enhancer v${installed_version} found applied != v${version} package.`,
        ...meta,
      };
};
