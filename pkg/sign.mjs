/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import { log } from './cli.mjs';
import { findNotion } from './helpers.mjs';
import { execSync } from 'child_process';

import check from './check.mjs';

export default async function (notionFolder = findNotion()) {
  const status = check(notionFolder);
  if (process.platform === 'darwin') {
    log`  {grey * app re-signing is only available on macos: exiting}`;
    return false;
  }

  if (status.code > 1 && status.executable) {
    log`  {grey * installing xcode cli tools}`;
    execSync('xcode-select --install');
    log`  {grey * codesigning app directory}`;
    execSync(`codesign --force --deep --sign - ${status.installation}`);
  } else log`  {grey * enhancements not found: skipping}`;

  return true;
}
