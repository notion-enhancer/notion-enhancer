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

module.exports = async function ({ delete_data, friendly_errors } = {}) {
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
        console.info(' -- removing app.asar.bak');
        fs.remove(asar_bak);
      } else
        await fs.move(asar_bak, path.resolve(`${helpers.__notion}/app.asar`));
    } else console.warn(` * ${asar_bak} not found: step skipped.`);

    // cleaning data folder: ~/.notion-enhancer
    if (await fs.pathExists(helpers.__data)) {
      console.info(` ...data folder ${helpers.__data} found.`);
      const valid = () =>
        typeof delete_data === 'string' &&
        ['y', 'n', ''].includes(delete_data.toLowerCase());
      if (valid())
        console.info(` > delete? [Y/n]: ${delete_data.toLowerCase()}`);
      while (!valid()) {
        process.stdout.write(' > delete? [Y/n]: ');
        delete_data = await helpers.readline();
      }
      console.info(
        delete_data.toLowerCase() === 'n'
          ? ` -- keeping ${helpers.__data}`
          : ` -- deleting ${helpers.__data}`
      );
      if (delete_data.toLowerCase() !== 'n') await fs.remove(helpers.__data);
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
              .replace(/(.asar)+/g, '.asar')
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
      console.error("file access failed: make sure notion isn't running!");
    } else console.error(err);
    return false;
  }
};
