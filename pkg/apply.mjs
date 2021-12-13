/**
 * notion-enhancer
 * (c) 2021 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://notion-enhancer.github.io/) under the MIT license
 */

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import asar from 'asar';

import { log, line, spinner } from './cli.mjs';
import { __dirname, pkg, findNotion, copyDir, readDirDeep } from './helpers.mjs';

import check from './check.mjs';
import remove from './remove.mjs';

export default async function (
  notionFolder = findNotion(),
  { overwritePrevious = undefined, takeBackup = true, applyDevPatch = false } = {}
) {
  let status = check(notionFolder);
  switch (status.code) {
    case 0: // not applied
      break;
    case 1: // corrupted
      throw Error(status.message);
    case 2: // same version already applied
      if (!applyDevPatch) {
        log`  {grey * notion-enhancer v${status.version} already applied}`;
        return true;
      }
      break;
    case 3: // diff version already applied
      log`  * ${status.message}`;
      const prompt = ['Y', 'y', 'N', 'n', ''],
        res = prompt.includes(overwritePrevious)
          ? overwritePrevious
          : await line.read('  {inverse > overwrite? [Y/n]:} ', prompt);
      if (res.toLowerCase() === 'n') {
        log`  * keeping previous version: exiting`;
        return false;
      }
      await remove(notionFolder, { cache: 'n' });
      status = await check(notionFolder);
  }

  let s;
  if (status.executable.endsWith('.asar')) {
    s = spinner('  * unpacking app files').loop();
    asar.extractAll(status.executable, status.executable.replace(/\.asar$/, ''));
    s.stop();
  }
  if (status.code === 0 && takeBackup) {
    s = spinner('  * backing up default app').loop();
    if (status.executable.endsWith('.asar')) {
      await fsp.rename(status.executable, status.executable + '.bak');
      status.executable = status.executable.replace(/\.asar$/, '');
    } else {
      await copyDir(status.executable, status.executable + '.bak');
    }
    s.stop();
  }

  s = spinner('  * inserting enhancements').loop();
  if (status.code === 0) {
    const notionFiles = (await readDirDeep(status.executable))
      .map((file) => file.path)
      .filter((file) => file.endsWith('.js') && !file.includes('node_modules'));
    for (const file of notionFiles) {
      const target = file.slice(status.executable.length + 1, -3),
        replacer = path.resolve(`${__dirname(import.meta)}/replacers/${target}.mjs`);
      if (fs.existsSync(replacer)) {
        await (await import(`./replacers/${target}.mjs`)).default(file);
      }
      await fsp.appendFile(
        file,
        `\n\n//notion-enhancer\nrequire('notion-enhancer')('${target}', exports, (js) => eval(js))`
      );
    }
  }
  const node_modules = path.resolve(`${status.executable}/node_modules/notion-enhancer`);
  await copyDir(`${__dirname(import.meta)}/../insert`, node_modules);
  s.stop();

  s = spinner('  * recording version').loop();
  await fsp.writeFile(
    path.resolve(`${node_modules}/package.json`),
    `{
      "name": "notion-enhancer",
      "version": "${pkg().version}",
      "main": "init.cjs"
    }`
  );
  s.stop();

  return true;
}
