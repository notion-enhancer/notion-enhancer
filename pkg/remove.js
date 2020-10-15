/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/) (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  helpers = require('./helpers.js');

// === title ===
//  ...information
//  * warning
//  > prompt
//  -- response
//  ~~ exit
// ### error ###

module.exports = async function ({
  overwrite_asar,
  delete_data,
  friendly_errors,
} = {}) {
  try {
    // extracted asar: modded
    const app_folder = path.resolve(`${helpers.__notion}/app`);
    if (await fs.pathExists(app_folder)) {
      console.info(` ...removing folder ${app_folder}`);
      await fs.remove(app_folder);
    } else console.warn(` * ${app_folder} not found: step skipped.`);

    // restoring original asar
    const asar_bak = path.resolve(`${helpers.__notion}/app.asar.bak`);
    if (await fs.pathExists(asar_bak)) {
      console.info(' ...moving asar.app.bak to app.asar');

      if (await fs.pathExists(path.resolve(`${helpers.__notion}/app.asar`))) {
        console.warn(' * app.asar already exists!');
        if (overwrite_asar === undefined) {
          do {
            process.stdout.write(' > overwrite? [Y/n]: ');
            overwrite_asar = await helpers.readline();
          } while (
            overwrite_asar &&
            !['y', 'n'].includes(overwrite_asar.toLowerCase())
          );
          overwrite_asar =
            !overwrite_asar || overwrite_asar.toLowerCase() === 'y';
        }
        console.info(
          overwrite_asar
            ? ' -- overwriting app.asar with app.asar.bak'
            : ' -- removing app.asar.bak'
        );
      }

      await (overwrite_asar || overwrite_asar === undefined
        ? fs.move(asar_bak, path.resolve(`${helpers.__notion}/app.asar`), {
            overwrite: true,
          })
        : fs.remove(asar_bak));
    } else console.warn(` * ${asar_bak} not found: step skipped.`);

    // cleaning data folder: ~/.notion-enhancer
    if (await fs.pathExists(helpers.__data)) {
      console.info(` ...data folder ${helpers.__data} found.`);
      if (delete_data === undefined) {
        do {
          process.stdout.write(' > delete? [Y/n]: ');
          delete_data = await helpers.readline();
        } while (
          delete_data &&
          !['y', 'n'].includes(delete_data.toLowerCase())
        );
        delete_data = !delete_data || delete_data.toLowerCase() === 'y';
      }
      console.info(
        delete_data
          ? ` -- deleting ${helpers.__data}`
          : ` -- keeping ${helpers.__data}`
      );
      if (delete_data) await fs.remove(helpers.__data);
    } else console.warn(` * ${helpers.__data} not found: step skipped.`);

    // patching launch script target of custom wrappers
    if (
      [
        '/opt/notion-app', // https://aur.archlinux.org/packages/notion-app/
        '/opt/notion', // https://github.com/jaredallard/notion-app
      ].includes(helpers.__notion)
    ) {
      console.info(
        ' ...patching app launcher (notion-app linux wrappers only).'
      );
      for (let bin_path of [
        `/usr/bin/${helpers.__notion.split('/')[2]}`,
        `${helpers.__notion}/${helpers.__notion.split('/')[2]}`,
      ]) {
        const bin_script = await fs.readFile(bin_path, 'utf8');
        if (!bin_script.includes('app.asar')) {
          await fs.outputFile(
            bin_path,
            bin_script
              .replace('electron app', 'electron app.asar')
              .replace('electron6 app', 'electron6 app.asar')
          );
        }
      }
    }

    console.info(' ~~ success.');
    return true;
  } catch (err) {
    console.error('### ERROR ###');
    if (err.code === 'EACCES' && friendly_errors) {
      console.error(
        `file access forbidden - ${
          process.platform === 'win32'
            ? 'make sure your user has elevated permissions.'
            : `try running "sudo chmod -R a+wr ${err.path.replace(
                'Notion.app',
                'Notion'
              )}" ${
                err.dest
                  ? `and/or "sudo chmod -R a+wr ${err.dest.replace(
                      'Notion.app',
                      'Notion'
                    )}"`
                  : ''
              }`
        }`
      );
    } else if (['EIO', 'EBUSY'].includes(err.code) && friendly_errors) {
      console.error('file access failed: is notion running?');
    } else console.error(err);
    return false;
  }
};
