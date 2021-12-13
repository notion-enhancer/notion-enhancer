/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import fsp from 'fs/promises';

import { log, spinner, line } from './cli.mjs';
import { findNotion } from './helpers.mjs';

import check from './check.mjs';

export default async function (notionFolder = findNotion(), { delCache = undefined } = {}) {
  const status = check(notionFolder);

  let s;
  if (status.code > 1 && status.executable) {
    s = spinner('  * removing enhancements').loop();
    await fsp.rm(status.executable, { recursive: true });
    s.stop();
  } else log`  {grey * enhancements not found: skipping}`;

  if (status.backup) {
    s = spinner('  * restoring backup').loop();
    await fsp.rename(status.backup, status.backup.replace(/\.bak$/, ''));
    s.stop();
  } else log`  {grey * backup not found: skipping}`;

  if (status.cache) {
    log`  * enhancer cache found: ${status.cache}`;
    const prompt = ['Y', 'y', 'N', 'n', ''];
    let res;
    if (prompt.includes(delCache)) {
      res = delCache;
      log`  {inverse > delete? [Y/n]:} ${delCache} {grey (auto-filled)}`;
    } else res = await line.read('  {inverse > delete? [Y/n]:} ', prompt);
    if (res.toLowerCase() === 'n') {
      log`  * keeping enhancer cache`;
    } else {
      s = spinner('  * deleting enhancer cache').loop();
      await fsp.rm(status.cache, { recursive: true });
      s.stop();
    }
  } else log`  {grey * enhancer cache not found: skipping}`;

  return true;
}
