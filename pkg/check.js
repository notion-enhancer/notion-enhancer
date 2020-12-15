/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

import path from 'path';
import fs from 'fs';
import { locations, files } from './helpers.js';

export default function ({ __notion = locations.notion() }) {
  const resolvePath = (filepath) => path.resolve(`${__notion}/${filepath}`),
    pathExists = (filepath) => fs.existsSync(resolvePath(filepath)),
    enhancerVersion = files.pkgJSON().version;
  let notion = {
    packed: pathExists('app.asar.bak'),
  };
  notion.backup = notion.packed
    ? pathExists('app.asar.bak')
      ? 'app.asar.bak'
      : undefined
    : pathExists('app.bak')
    ? 'app.bak'
    : undefined;
  if (!pathExists('app/node_modules/notion-enhancer')) {
    notion.executable = pathExists('app')
      ? 'app'
      : pathExists('app.asar')
      ? 'app.asar'
      : undefined;
    if (!notion.executable && notion.backup) {
      notion.restored = true;
      notion.backup = resolvePath(notion.backup);
      notion.executable = notion.backup.replace(/\.bak$/, '');
      fs.renameSync(notion.backup, notion.executable);
    } else {
      notion.executable = notion.executable
        ? resolvePath(notion.executable)
        : '';
    }
    return notion.executable
      ? {
          code: 0,
          msg: `notion-enhancer has not been applied.`,
          executable: notion.executable,
          restored: notion.restored || false,
        }
      : {
          code: 1,
          msg: `notion installation has been corrupted: no executable found.`,
          restored: notion.restored || false,
        };
  }
  notion = {
    version: files.readJSON(
      resolvePath('app/node_modules/notion-enhancer/package.json')
    ).version,
    executable: resolvePath('app'),
    packed: resolvePath(notion.packed),
    backup: resolvePath(notion.backup),
  };
  return notion.version === enhancerVersion
    ? {
        code: 2,
        msg: `notion-enhancer v${enhancerVersion} applied.`,
        ...notion,
      }
    : {
        code: 3,
        msg: `notion-enhancer v${notion.version} found applied != v${enhancerVersion} package.`,
        ...notion,
      };
}
