/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';
const os = require('os'),
  fs = require('fs-extra'),
  path = require('path'),
  exec = require('util').promisify(require('child_process').exec),
  { getNotion, readline, data_folder } = require('./helpers.js');

// '=== title ==='
// ' ...information'
// ' * warning'
// ' > prompt'
// ' -> response'
// ' ~~ exit'
// '### error ###'

let __notion = getNotion();

module.exports = async function (yes) {
  console.info('=== NOTION RESTORATION LOG ===');
  try {
    const file_operations = [];
    __notion = await __notion;

    const app_folder = path.join(__notion, 'app');
    if (await fs.pathExists(app_folder)) {
      console.info(` ...removing folder ${app_folder}`);
      file_operations.push(fs.remove(app_folder));
    } else console.warn(` * ${app_folder} not found: step skipped.`);

    const asar_bak = path.join(__notion, 'app.asar.bak');
    if (await fs.pathExists(asar_bak)) {
      console.info(' ...moving asar.app.bak to app.asar');

      let write = true;
      if (await fs.pathExists(path.join(__notion, 'app.asar'))) {
        console.warn(' * app.asar already exists!');
        if (!yes) {
          do {
            process.stdout.write(' > overwrite? [Y/n]: ');
            write = await readline();
          } while (write && !['y', 'n'].includes(write.toLowerCase()));
          write = !write || write.toLowerCase() == 'y';
        } else write = true;
        console.info(
          write
            ? ' -> overwriting app.asar with app.asar.bak'
            : ' -> removing app.asar.bak'
        );
      }

      file_operations.push(
        write
          ? fs.move(asar_bak, path.join(__notion, 'app.asar'), {
              overwrite: true,
            })
          : fs.remove(asar_bak)
      );
    } else console.warn(` * ${asar_bak} not found: step skipped.`);

    if (await fs.pathExists(data_folder)) {
      console.log(` ...data folder ${data_folder} found.`);
      let write = true;
      if (!yes) {
        do {
          process.stdout.write(' > delete? [Y/n]: ');
          write = await readline();
        } while (write && !['y', 'n'].includes(write.toLowerCase()));
        write = !write || write.toLowerCase() == 'y';
      } else write = true;
      console.info(
        write ? ` -> deleting ${data_folder}` : ` -> keeping ${data_folder}`
      );
      if (write) file_operations.push(fs.remove(data_folder));
    } else console.warn(` * ${data_folder} not found: step skipped.`);

    await Promise.all(file_operations);

    if (
      [
        '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
        '/opt/notion', // https://github.com/jaredallard/notion-app
      ].includes(__notion)
    ) {
      console.info(
        ' ...patching app launcher (notion-app linux wrappers only).'
      );
      for (let bin_path of [
        `/usr/bin/${__notion.split('/')[2]}`,
        `${__notion}${__notion.split('/')[2]}`,
      ]) {
        const bin_script = await fs.readFile(bin_path, 'utf8');
        if (!bin_script.includes('app.asar')) {
          await fs.outputFile(
            bin_path,
            bin_script.replace('electron app\n', 'electron app.asar\n')
          );
        }
      }
    }
  } catch (err) {
    console.error(`### ERROR ###\n${err}`);
  }
  console.info(' ~~ success.');
  console.info('=== END OF LOG ===');
};
