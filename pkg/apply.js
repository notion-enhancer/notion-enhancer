/*
 * notion-enhancer
 * (c) 2020 dragonwocky <thedragonring.bod@gmail.com> (https://dragonwocky.me/) (https://dragonwocky.me/)
 * under the MIT license
 */

'use strict';

const fs = require('fs-extra'),
  path = require('path'),
  { readdirIterator } = require('readdir-enhanced'),
  { extractAll } = require('asar'),
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
module.exports = async function ({ overwrite_version, friendly_errors } = {}) {
  try {
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
          !overwrite_version || overwrite_version.toLowerCase() === 'y';
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
    const asar_app = path.resolve(`${__notion}/app.asar`);
    extractAll(asar_app, `${path.resolve(`${__notion}/app`)}`);
    fs.move(asar_app, path.resolve(`${__notion}/app.asar.bak`));

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
        if (bin_script.includes('app.asar')) {
          await fs.outputFile(
            bin_path,
            bin_script
              .replace(' app.asar ', ' app ')
          );
        }
      }
    }

    for await (let insertion_target of readdirIterator(
      path.resolve(`${__notion}/app`),
      {
        deep: (stats) => stats.path.indexOf('node_modules') === -1,
        filter: (stats) => stats.isFile() && stats.path.endsWith('.js'),
      }
    )) {
      insertion_target = path.resolve(`${__notion}/app/${insertion_target}`);
      fs.appendFile(
        insertion_target,
        `\n\n//notion-enhancer\nrequire('${helpers.realpath(
          __dirname
        )}/loader.js')(__filename, exports);`
      );
    }

    // not resolved, nothing depends on it so it's just a "let it do its thing"
    console.info(' ...recording enhancement version.');
    fs.outputFile(
      path.resolve(`${__notion}/app/ENHANCER_VERSION.txt`),
      version
    );
    fs.outputFile(path.resolve(`${helpers.data_folder}/version.txt`), version);

    console.info(' ~~ success.');
    return true;
  } catch (err) {
    console.error('### ERROR ###');
    if (err.toString().includes('EACCESS') && friendly_errors) {
      console.error(
        'file access forbidden: try again with sudo or in an elevated/admin prompt.'
      );
    } else if (err.toString().includes('EIO') && friendly_errors) {
      console.error('file access failed: is notion running?');
    } else console.error(err);
    return false;
  }
};
