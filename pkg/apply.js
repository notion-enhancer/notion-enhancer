/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';
const fs = require('fs-extra'),
  path = require('path'),
  helpers = require('./helpers.js'),
  { version } = require('../package.json');

// === title ===
//  ...information
//  * warning
//  > prompt
//  -- response
//  ~~ exit
// ### error ###

let __notion = helpers.getNotion();
module.exports = async function ({ overwrite_version } = {}) {
  try {
    __notion = await __notion;
    await fs.ensureDir(helpers.data_folder);

    // handle pre-existing installations: app.asar present? version set in data folder? overwrite?
    const check_app = await require('./check.js')();
    switch (check_app.code) {
      case 1:
        console.log(`~~ notion-enhancer v${version} already applied.`);
        return true;
      case 2:
        console.log(` * ${check_app.msg}`);
        do {
          process.stdout.write(' > overwrite? [Y/n]: ');
          overwrite_version = await helpers.readline();
        } while (
          overwrite_version &&
          !['y', 'n'].includes(overwrite_version.toLowerCase())
        );
        overwrite_version =
          !overwrite_version || overwrite_version.toLowerCase() == 'y';
        if (!overwrite_version) {
          console.info(' ~~ keeping previous version: exiting.');
          return false;
        }
        console.info(
          ' -- removing previous enhancements before applying new version.'
        );
        await require('./remove.js')({
          overwrite_asar: true,
          delete_data: false,
        });
    }
    console.info(' ...unpacking app.asar');
    const asar_app = path.join(__notion, 'app.asar'),
      asar_exec = path.join(
        __dirname,
        '..',
        'node_modules',
        'asar',
        'bin',
        'asar.js'
      );
    await helpers.exec(
      `"${asar_exec}" extract "${asar_app}" "${path.join(__notion, 'app')}"`
    );
    fs.move(asar_app, path.join(__notion, 'app.asar.bak'));

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
        `${__notion}${__notion.split('/')[2]}`,
      ]) {
        const bin_script = await fs.readFile(bin_path, 'utf8');
        if (bin_script.includes('app.asar')) {
          await fs.outputFile(
            bin_path,
            bin_script.replace('electron app.asar\n', 'electron app\n')
          );
        }
      }
    }

    const mods = await fs.readdir(path.join(__dirname, '..', 'mods')),
      invalid_mods = [],
      loaded_mods = [];
    for (let dir of mods) {
      try {
        const mod = require(`../mods/${dir}/mod.js`);
        if (
          !mod.id ||
          !mod.name ||
          !mod.version ||
          !mod.author ||
          !['extension', 'theme', 'core'].includes(mod.type)
        )
          throw Error;
        loaded_mods.push(mod.name);
        console.log(mod.renderer.toString());
      } catch (err) {
        invalid_mods.push(dir);
      }
    }
    if (loaded_mods.length)
      console.info(
        `<notion-enhancer> enhancements loaded: ${loaded_mods.join(', ')}.`
      );
    if (invalid_mods.length)
      console.error(
        `<notion-enhancer> invalid mods found: ${invalid_mods.join(', ')}.`
      );

    // not resolved, nothing depends on it so it's just a "let it do its thing"
    console.info(' ...recording enhancement version.');
    fs.outputFile(path.join(__notion, 'app', 'ENHANCER_VERSION.txt'), version);
    fs.outputFile(path.join(helpers.data_folder, 'version.txt'), version);

    console.info(' ~~ success.');
    return true;
  } catch (err) {
    console.error('### ERROR ###');
    console.error(err);
    return false;
  }
};
