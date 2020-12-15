/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * (https://dragonwocky.me/notion-enhancer) under the MIT license
 */

'use strict';

import fs from 'fs';
import fsp from 'fs/promises';
import check from './check.js';
import { locations, line } from './helpers.js';

export default async function ({
  deleteConfig,
  deleteCache,
  __notion = locations.notion(),
} = {}) {
  const status = check({ __notion });
  let spinner;

  if (status.code > 1 && status.executable) {
    spinner = line.spinner('  * removing enhancements').loop();
    await fsp.rmdir(status.executable, { recursive: true });
    spinner.stop();
  } else console.warn(line.chalk.grey('  * enhancements not found: skipping'));

  if (status.restored || status.backup) {
    spinner = line.spinner('  * restoring backup').loop();
    if (status.backup)
      await fsp.rename(status.backup, status.backup.replace(/\.bak$/, ''));
    spinner.stop();
  } else console.warn(line.chalk.grey('  * backup not found: skipping'));

  const prompt = {
    prefix: line.chalk`  {inverse > delete? [Y/n]:} `,
    responses: ['Y', 'y', 'N', 'n', ''],
  };
  for (let folder of [
    {
      description: 'config folder',
      name: 'config',
      action: deleteConfig,
      location: locations.config(),
    },
    {
      description: 'module cache',
      name: 'cache',
      action: deleteCache,
      location: locations.cache(),
    },
  ]) {
    if (fs.existsSync(folder.location)) {
      console.info(`  * ${folder.description} ${folder.location} found`);
      const action = prompt.responses.includes(folder.action)
        ? folder.action
        : (await line.read(prompt.prefix, prompt.responses)).toLowerCase();
      if (action === folder.action)
        console.info(
          `${prompt.prefix}${folder.action} ${line.chalk.grey('(auto-filled)')}`
        );
      if (action !== 'n') {
        spinner = line.spinner(`  * deleting ${folder.name}`).loop();
        await fsp.rmdir(folder.location, { recursive: true });
        spinner.stop();
      } else console.info(`  * keeping ${folder.name}`);
    } else
      console.warn(
        line.chalk.grey(`  * ${folder.description} not found: skipping`)
      );
  }

  if (
    !fs.existsSync(locations.config()) &&
    !fs.existsSync(locations.cache()) &&
    fs.existsSync(locations.enhancer())
  )
    fsp.rmdir(locations.enhancer()).catch((err) => {});

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
      if (!script.includes('app.asar')) {
        await fsp.writeFile(
          bin,
          script.replace(/(electron\d*) app(.asar)+/g, '$1 app.asar')
        );
      }
    }
    spinner.stop();
  }
  return true;
}
