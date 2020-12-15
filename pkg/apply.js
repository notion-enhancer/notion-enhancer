/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import asar from 'asar';
import check from './check.js';
import remove from './remove.js';
import { locations, line, files } from './helpers.js';

export default async function ({
  overwriteOld,
  __notion = locations.notion(),
} = {}) {
  let status = check({ __notion }),
    spinner;
  switch (status.code) {
    case 1:
      throw Error(status.msg);
    case 2:
      console.info(
        line.chalk`  {grey * notion-enhancer v${status.version} already applied}`
      );
      return true;
    case 3:
      console.warn(`  * ${status.msg}`);
      const prompt = {
          prefix: line.chalk`  {inverse > overwrite? [Y/n]:} `,
          responses: ['Y', 'y', 'N', 'n', ''],
        },
        action = prompt.responses.includes(overwriteOld)
          ? overwriteOld
          : (await line.read(prompt.prefix, prompt.responses)).toLowerCase();
      if (action.toLowerCase() === 'n') {
        console.info('  * keeping previous version: exiting');
        return false;
      }
      await remove({ deleteConfig: 'n', deleteCache: 'n' });
      status = check();
  }
  if (status.executable.endsWith('app.asar')) {
    spinner = line.spinner('  * unpacking app files').loop();
    asar.extractAll(
      status.executable,
      status.executable.replace(/\.asar$/, '')
    );
    spinner.stop();
    spinner = line.spinner('  * backing up default app').loop();
    await fsp.rename(status.executable, status.executable + '.bak');
    status.executable = status.executable.replace(/\.asar$/, '');
    spinner.stop();
  } else {
    spinner = line.spinner('  * backing up default app').loop();
    await files.copyDir(status.executable, status.executable + '.bak');
    spinner.stop();
  }

  if (
    status.packed &&
    [
      '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
      '/opt/notion', // https://github.com/jaredallard/notion-app
    ].includes(__notion)
  ) {
    spinner = line
      .spinner(
        line.chalk`  * patching app launcher {grey (notion-app linux wrappers only)}`
      )
      .loop();
    for (let bin of [
      `/usr/bin/${__notion.split('/')[2]}`,
      `${__notion}/${__notion.split('/')[2]}`,
    ]) {
      const script = await fsp.readFile(bin, 'utf8');
      if (script.includes('app.asar')) {
        await fsp.writeFile(
          bin,
          script.replace(/(electron\d*) app(.asar)+/g, '$1 app')
        );
      }
    }
    spinner.stop();
  }

  // todo: patch app properties so dark/light mode can be detected
  // process.platform === 'darwin' && path.resolve(`${status.executable}/../../Info.plist`)

  spinner = line
    .spinner('  * inserting enhancements + recording version')
    .loop();

  for (let file of (await files.readDirDeep(status.executable))
    .map((file) => file.path)
    .filter((file) => file.endsWith('.js') && !file.includes('node_modules'))) {
    const target = file.slice(status.executable.length + 1);
    let replacer = path.resolve(
      `${files.__dirname(import.meta)}/replacers/${target}`
    );
    if (fs.existsSync(replacer)) {
      replacer = (await import(replacer)).default;
      await replacer(file);
    }
    await fsp.appendFile(
      file,
      `\n\n//notion-enhancer\nrequire('notion-enhancer')('${target}', exports);`
    );
  }

  const node_modules = path.resolve(
    `${status.executable}/node_modules/notion-enhancer`
  );
  await files.copyDir(
    `${files.__dirname(import.meta)}/../insert`,
    node_modules
  );
  await fsp.writeFile(
    path.resolve(`${node_modules}/package.json`),
    `{
      "name": "notion-enhancer",
      "version": "${files.pkgJSON().version}",
      "main": "loader.js"
    }`
  );

  spinner.stop();
  return true;
}
