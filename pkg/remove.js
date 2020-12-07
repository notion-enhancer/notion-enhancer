/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/) (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  { readline, __data } = require('./helpers.js');

// === title ===
//  ...information
//  * warning
//  > prompt
//  -- response
//  ~~ exit
// ### error ###

module.exports = async function ({
  __notion,
  delete_data,
  friendly_errors,
} = {}) {
  try {
    const check_app = await require('./check.js')({ __notion });
    // extracted asar: modded
    if (check_app.code > 1 && check_app.executable) {
      console.info(` ...removing enhancements`);
      await fs.remove(check_app.executable);
    } else console.warn(` * enhancements not found: step skipped.`);

    // restoring original asar
    if (check_app.backup) {
      console.info(' ...restoring backup');
      await fs.move(check_app.backup, check_app.backup.replace(/\.bak$/, ''));
    } else console.warn(` * backup not found: step skipped.`);

    // cleaning data folder: ~/.notion-enhancer
    if (await fs.pathExists(__data)) {
      console.info(` ...data folder ${__data} found.`);
      const valid = () =>
        typeof delete_data === 'string' &&
        ['y', 'n', ''].includes(delete_data.toLowerCase());
      if (valid())
        console.info(` > delete? [Y/n]: ${delete_data.toLowerCase()}`);
      while (!valid()) {
        process.stdout.write(' > delete? [Y/n]: ');
        delete_data = await readline();
      }
      console.info(
        delete_data.toLowerCase() === 'n'
          ? ` -- keeping ${__data}`
          : ` -- deleting ${__data}`
      );
      if (delete_data.toLowerCase() !== 'n') await fs.remove(__data);
    } else console.warn(` * ${__data} not found: step skipped.`);

    // patching launch script target of custom wrappers
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
        `${__notion}/${__notion.split('/')[2]}`,
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
        }, and make sure path(s) are not open.`
      );
    } else if (['EIO', 'EBUSY'].includes(err.code) && friendly_errors) {
      console.error("file access failed: make sure notion isn't running!");
    } else console.error(err);
    return false;
  }
};
