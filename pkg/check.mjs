/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import fs from 'fs';
import path from 'path';

import { pkg, findNotion, findEnhancerCache } from './helpers.mjs';

export default function (notionFolder = findNotion()) {
  const resolvePath = (filepath) => path.resolve(`${notionFolder}/${filepath}`),
    pathExists = (filepath) => fs.existsSync(resolvePath(filepath)),
    enhancerVersion = pkg().version;

  const executableApp = pathExists('app'),
    executableAsar = pathExists('app.asar'),
    executable = executableApp ? 'app' : executableAsar ? 'app.asar' : undefined,
    backupApp = pathExists('app.bak'),
    backupAsar = pathExists('app.asar.bak'),
    backup = backupApp ? 'app.bak' : backupAsar ? 'app.asar.bak' : undefined,
    insert = pathExists('app/node_modules/notion-enhancer'),
    insertVersion = insert
      ? pkg(resolvePath('app/node_modules/notion-enhancer/package.json')).version
      : undefined,
    insertCache = findEnhancerCache();

  const res = {
    executable: executable ? resolvePath(executable) : undefined,
    backup: backup ? resolvePath(backup) : undefined,
    cache: fs.existsSync(insertCache) ? insertCache : undefined,
  };
  if (insert) {
    if (insertVersion === enhancerVersion) {
      res.code = 2;
      res.version = enhancerVersion;
      res.message = `notion-enhancer v${enhancerVersion} applied.`;
    } else {
      res.code = 3;
      res.version = insertVersion;
      res.message = `notion-enhancer v${insertVersion} found applied != v${enhancerVersion} package.`;
    }
  } else {
    if (executable) {
      res.code = 0;
      res.message = 'notion-enhancer has not been applied.';
    } else {
      res.code = 1;
      res.message = 'notion installation has been corrupted, no executable found.';
    }
  }
  return res;
}
